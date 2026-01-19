import polars as pl
import clickhouse_connect
import os
import time
import glob

# --- Configurações ---
CLICKHOUSE_HOST = 'clickhouse'
DB_NAME = 'cnpj_analytics'
DATA_DIR = '/app/dados_temp'

# Mapeamento de Arquivos para Tabelas e Colunas
# Baseado no Layout da Receita Federal
FILES_CONFIG = {
    'ESTABELE': {
        'table': 'estabelecimentos',
        'columns': [
            'cnpj_basico', 'cnpj_ordem', 'cnpj_dv', 'identificador_matriz_filial', 
            'nome_fantasia', 'situacao_cadastral', 'data_situacao_cadastral', 
            'motivo_situacao_cadastral', 'nome_cidade_exterior', 'pais', 
            'data_inicio_atividade', 'cnae_fiscal_principal', 'cnae_fiscal_secundaria', 
            'tipo_logradouro', 'logradouro', 'numero', 'complemento', 'bairro', 
            'cep', 'uf', 'municipio', 'ddd1', 'telefone1', 'ddd2', 'telefone2', 
            'ddd_fax', 'fax', 'correio_eletronico', 'situacao_especial', 'data_situacao_especial'
        ]
    },
    'MUNIC': {
        'table': 'dim_municipios',
        'columns': ['codigo', 'descricao']
    },
    'CNAE': {
        'table': 'dim_cnae',
        'columns': ['codigo', 'descricao']
    },
    'EMPRE': {
        'table': 'empresas',
        'columns': [
            'cnpj_basico', 'razao_social', 'natureza_juridica', 'qualificacao_responsavel', 
            'capital_social', 'porte_empresa', 'ente_federativo_responsavel'
        ]
    }
    # Adicione outros mapeamentos (SOCIOS, MOTIVOS) conforme necessário
}

def get_client():
    retries = 15
    while retries > 0:
        try:
            return clickhouse_connect.get_client(host=CLICKHOUSE_HOST)
        except Exception as e:
            print(f"Aguardando ClickHouse... (Erro: {e})")
            time.sleep(5)
            retries -= 1
    raise Exception("Falha conexão DB")

def setup_db(client):
    client.command(f'CREATE DATABASE IF NOT EXISTS {DB_NAME}')
    
    # Tabela Principal (Estabelecimentos)
    client.command(f"""
    CREATE TABLE IF NOT EXISTS {DB_NAME}.estabelecimentos (
        cnpj_basico FixedString(8),
        cnpj_ordem FixedString(4),
        cnpj_dv FixedString(2),
        identificador_matriz_filial LowCardinality(String),
        nome_fantasia String,
        situacao_cadastral LowCardinality(String),
        data_situacao_cadastral Nullable(Date),
        cnae_fiscal_principal String,
        uf LowCardinality(FixedString(2)),
        municipio String
    ) ENGINE = MergeTree() ORDER BY (uf, cnae_fiscal_principal, situacao_cadastral)
    """)

    # Tabela Auxiliar: Municípios (Para fazer JOIN e pegar o nome da cidade)
    client.command(f"""
    CREATE TABLE IF NOT EXISTS {DB_NAME}.dim_municipios (
        codigo String,
        descricao String
    ) ENGINE = Join(ANY, LEFT, codigo)
    """)

    # Tabela Auxiliar: CNAEs
    client.command(f"""
    CREATE TABLE IF NOT EXISTS {DB_NAME}.dim_cnae (
        codigo String,
        descricao String
    ) ENGINE = Join(ANY, LEFT, codigo)
    """)
    
    print("Banco estruturado.")

def process_file(filepath, file_type, client):
    print(f"Processando {filepath} [{file_type}]...")
    
    config = FILES_CONFIG[file_type]
    
    # 1. Leitura Lazy com Polars
    # A Receita usa encoding latin-1 e separador ;
    q = pl.scan_csv(
        filepath, 
        separator=';', 
        has_header=False, 
        encoding='latin-1', 
        quote_char='"',
        ignore_errors=True,
        truncate_ragged_lines=True # Ajuda se houver linhas quebradas
    )

    # 2. Renomeia as colunas baseado na ordem
    # O Polars cria colunas padrão "column_1", "column_2"...
    # Vamos mapear apenas as que precisamos para economizar RAM
    
    # Exemplo simplificado de projeção para ESTABELECIMENTOS
    if file_type == 'ESTABELE':
        q = q.select([
            pl.col("column_1").alias("cnpj_basico"),
            pl.col("column_2").alias("cnpj_ordem"),
            pl.col("column_3").alias("cnpj_dv"),
            pl.col("column_4").alias("identificador_matriz_filial"),
            pl.col("column_5").alias("nome_fantasia"),
            pl.col("column_6").alias("situacao_cadastral"),
            pl.col("column_7").alias("data_situacao_cadastral"),
            pl.col("column_12").alias("cnae_fiscal_principal"),
            pl.col("column_20").alias("uf"),
            pl.col("column_21").alias("municipio")
        ]).with_columns(
            pl.col("data_situacao_cadastral").str.to_date("%Y%m%d", strict=False)
        )
    elif file_type in ['MUNIC', 'CNAE']:
        q = q.select([
            pl.col("column_1").alias("codigo"),
            pl.col("column_2").alias("descricao")
        ])

    # 3. Inserção em Streaming (Batch)
    # Se for arquivo pequeno (Dimensões), pode coletar tudo. Se for grande (Estabelecimentos), streaming.
    try:
        if file_type in ['MUNIC', 'CNAE']:
            df = q.collect() # Tabelas pequenas cabem na RAM
            client.insert_df(f'{DB_NAME}.{config["table"]}', df)
        else:
            # Arquivos gigantes
            df_iter = q.collect(streaming=True)
            client.insert_df(f'{DB_NAME}.{config["table"]}', df_iter)
            
        print(f"Sucesso: {filepath}")
    except Exception as e:
        print(f"Erro ao inserir {filepath}: {e}")

def main():
    client = get_client()
    setup_db(client)

    # Itera sobre todos os arquivos extraídos na pasta
    # A ordem importa: Carregue dimensões primeiro, depois fatos
    priority_order = ['CNAE', 'MUNIC', 'ESTABELE']
    
    # 1. Primeiro as tabelas de referência
    for file_type in priority_order:
        # Busca arquivos que contenham o nome (ex: *.MUNIC*.csv)
        # Nota: Os arquivos extraídos geralmente não tem extensão definida ou são .csv
        # Ajuste o padrão glob conforme a extração real
        files = glob.glob(os.path.join(DATA_DIR, f"*{file_type}*"))
        
        for f in files:
            if not f.endswith('.zip'): # Ignora os zips, pega os extraídos
                process_file(f, file_type, client)

if __name__ == "__main__":
    main()