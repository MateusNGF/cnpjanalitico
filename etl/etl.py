import polars as pl
import clickhouse_connect
import os
import time
import glob
import sys

# ---------------------------------------------------------
# CONFIGURAÇÃO
# ---------------------------------------------------------
print("\n" + "="*40)
print("CNPJ ANALYTICS - ETL V3 (OPTIMIZED)")
print("="*40 + "\n")

DB_NAME = os.getenv('DB_NAME', 'cnpj_analytics')
DATA_DIR = os.getenv('DATA_DIR', r'W:\app\dados_temp')
SETUP_FILE = 'setup.sql'

# Configuração alinhada EXATAMENTE com setup_optimized.sql
FILES_CONFIG = {
    'ESTABELE': {
        'table': 'estabelecimentos',
        # Nota: Colunas de endereço (logradouro, cep, etc) removidas 
        # para alinhar com a tabela otimizada de analytics.
        'columns': [
            'cnpj_basico', 'cnpj_ordem', 'cnpj_dv', 'identificador_matriz_filial', 
            'nome_fantasia', 'situacao_cadastral', 'data_situacao_cadastral', 
            'cnae_fiscal_principal', 'uf', 'municipio', 'data_inicio_atividade', 
            'ddd1', 'telefone1', 'correio_eletronico'
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
            'cnpj_basico', 'razao_social', 'natureza_juridica', 
            'capital_social', 'porte_empresa'
        ]
    },
    'SOCIO': {
        'table': 'socios',
        'columns': [
            'cnpj_basico', 'identificador_socio', 'nome_socio', 'cnpj_cpf_socio',
            'qualificacao_socio', 'data_entrada_sociedade', 'pais', 'faixa_etaria'
        ]
    },
    'MOTI': {
        'table': 'dim_motivos',
        'columns': ['codigo', 'descricao']
    },
    'NATJU': {
        'table': 'dim_naturezas_juridicas',
        'columns': ['codigo', 'descricao']
    },
    'SIMPLES': {
        'table': 'simples',
        'columns': [
            'cnpj_basico', 'opcao_pelo_simples', 'data_opcao_simples', 'data_exclusao_simples',
            'opcao_pelo_mei', 'data_opcao_mei', 'data_exclusao_mei'
        ]
    }
}

# ---------------------------------------------------------
# FUNÇÕES DE BANCO DE DADOS
# ---------------------------------------------------------
def get_client():
    """Estabelece conexão com retry automático."""
    retries = 10
    while retries > 0:
        try:
            return clickhouse_connect.get_client(
                host='rpnr0uu71a.eastus2.azure.clickhouse.cloud',
                user='default',
                password='fMfeEsJ.8FkK7', # Recomendo mover para os.getenv('CH_PASSWORD')
                secure=True,
                connect_timeout=30,
                send_receive_timeout=300 # Aumentado para grandes inserts
            )
        except Exception as e:
            print(f"Tentando reconectar... (Erro: {e})")
            time.sleep(5)
            retries -= 1
    raise Exception("Falha crítica: Não foi possível conectar ao ClickHouse.")

def init_db(client):
    """Inicializa o banco usando o script SQL otimizado."""
    client.command(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    
    script_path = os.path.join(os.path.dirname(__file__), SETUP_FILE)
    
    if not os.path.exists(script_path):
        print(f"ERRO: Arquivo '{SETUP_FILE}' não encontrado!")
        print("Salve o SQL gerado anteriormente com este nome na mesma pasta do script.")
        sys.exit(1)

    print(f"Aplicando schema do arquivo: {SETUP_FILE}...")
    with open(script_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()
        # Remove comentários simples para evitar erros de parsing
        lines = [line for line in sql_content.split('\n') if not line.strip().startswith('--')]
        full_sql = '\n'.join(lines)
        
        # Divide comandos por ponto e vírgula
        commands = [c.strip() for c in full_sql.split(';') if c.strip()]
        
        for cmd in commands:
            try:
                # Ignora comandos vazios
                if len(cmd) < 5: continue
                client.command(cmd)
            except Exception as e:
                # Se a tabela já existe, o erro é esperado em alguns casos, mas printamos para debug
                if "already exists" not in str(e):
                    print(f"AVISO SQL: {e}\nNo comando: {cmd[:50]}...")
    
    print("Schema verificado.")

# ---------------------------------------------------------
# PIPELINE DE DADOS (POLARS)
# ---------------------------------------------------------
def process_file(filepath, file_type, client):
    config = FILES_CONFIG[file_type]
    table_name = f'{DB_NAME}.{config["table"]}'
    
    print(f"-> Lendo: {os.path.basename(filepath)}")

    # Lazy Frame: Não carrega nada na memória ainda
    q = pl.scan_csv(
        filepath, 
        separator=';', 
        has_header=False, 
        encoding='utf8-lossy', 
        quote_char='"',
        ignore_errors=True,
        truncate_ragged_lines=True,
        infer_schema_length=0 # Força tudo como String
    )

    # Transformações específicas por tipo de arquivo
    # IMPORTANTE: Mapear column_X corretas do Layout da Receita
    if file_type == 'ESTABELE':
        q = q.select([
            pl.col("column_1").alias("cnpj_basico"),
            pl.col("column_2").alias("cnpj_ordem"),
            pl.col("column_3").alias("cnpj_dv"),
            pl.col("column_4").alias("identificador_matriz_filial"),
            pl.col("column_5").str.strip_chars().alias("nome_fantasia"),
            pl.col("column_6").alias("situacao_cadastral"),
            pl.col("column_7").alias("data_situacao_cadastral"), # Data
            pl.col("column_11").alias("data_inicio_atividade"),  # Data
            pl.col("column_12").alias("cnae_fiscal_principal"),
            pl.col("column_20").alias("uf"),
            pl.col("column_21").alias("municipio"),
            pl.col("column_22").alias("ddd1"),
            pl.col("column_23").alias("telefone1"),
            pl.col("column_28").str.strip_chars().alias("correio_eletronico")
        ]).with_columns([
            pl.col("data_situacao_cadastral").str.to_date("%Y%m%d", strict=False),
            pl.col("data_inicio_atividade").str.to_date("%Y%m%d", strict=False)
        ])

    elif file_type == 'EMPRE':
        q = q.select([
            pl.col("column_1").alias("cnpj_basico"),
            pl.col("column_2").str.strip_chars().alias("razao_social"),
            pl.col("column_3").alias("natureza_juridica"),
            pl.col("column_5").alias("capital_social"),
            pl.col("column_6").alias("porte_empresa")
        ]).with_columns([
            # Converte virgula para ponto e depois para Float
            pl.col("capital_social").str.replace(",", ".").cast(pl.Float64, strict=False)
        ])

    elif file_type == 'SOCIO':
        q = q.select([
            pl.col("column_1").alias("cnpj_basico"),
            pl.col("column_2").alias("identificador_socio"),
            pl.col("column_3").str.strip_chars().alias("nome_socio"),
            pl.col("column_4").alias("cnpj_cpf_socio"),
            pl.col("column_5").alias("qualificacao_socio"),
            pl.col("column_6").alias("data_entrada_sociedade"),
            pl.col("column_7").alias("pais"),
            pl.col("column_11").alias("faixa_etaria")
        ]).with_columns([
            pl.col("data_entrada_sociedade").str.to_date("%Y%m%d", strict=False)
        ])

    elif file_type == 'SIMPLES':
        q = q.select([
            pl.col("column_1").alias("cnpj_basico"),
            pl.col("column_2").alias("opcao_pelo_simples"),
            pl.col("column_3").alias("data_opcao_simples"),
            pl.col("column_4").alias("data_exclusao_simples"),
            pl.col("column_5").alias("opcao_pelo_mei"),
            pl.col("column_6").alias("data_opcao_mei"),
            pl.col("column_7").alias("data_exclusao_mei")
        ]).with_columns([
            pl.col("data_opcao_simples").str.to_date("%Y%m%d", strict=False),
            pl.col("data_exclusao_simples").str.to_date("%Y%m%d", strict=False),
            pl.col("data_opcao_mei").str.to_date("%Y%m%d", strict=False),
            pl.col("data_exclusao_mei").str.to_date("%Y%m%d", strict=False)
        ])

    elif file_type in ['MUNIC', 'CNAE', 'MOTI', 'NATJU']:
        q = q.select([
            pl.col("column_1").alias("codigo"),
            pl.col("column_2").str.strip_chars().alias("descricao")
        ])

    # Execução do Streaming e Inserção
    try:
        # Batch size moderado para evitar timeouts em grandes colunas (ex: razão social)
        BATCH_SIZE = 100000 
        
        # O Polars gerencia o streaming, lendo o CSV em pedaços e processando
        processed_batches = q.collect(engine="streaming")
        
        total_rows = processed_batches.height
        if total_rows == 0:
            return

        print(f"   Total do arquivo: {total_rows} registros.")
        
        for i in range(0, total_rows, BATCH_SIZE):
            batch = processed_batches.slice(i, BATCH_SIZE)
            
            # Retry logic para cada lote (batch)
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    client.insert(
                        table_name,
                        batch.rows(),
                        column_names=batch.columns
                    )
                    break # Sucesso
                except Exception as e:
                    if attempt < max_retries - 1:
                        print(f"      [RETRY {attempt+1}/{max_retries}] Bug no lote {i}: {e}")
                        time.sleep(5)
                    else:
                        raise e # Falha definitiva
            
            # Log de progresso a cada 500k ou fim do arquivo
            if (i + BATCH_SIZE) % 500000 == 0 or (i + BATCH_SIZE) >= total_rows:
                print(f"      -> Progresso: {min(i + BATCH_SIZE, total_rows)} / {total_rows}...")
            
        print(f"   Sucesso.")
        
    except Exception as e:
        print(f"ERRO CRÍTICO no arquivo {filepath}: {e}")

# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------
def main():
    abs_data_dir = os.path.abspath(DATA_DIR)
    if not os.path.exists(abs_data_dir):
        print(f"Diretório de dados não encontrado: {abs_data_dir}")
        return

    client = get_client()
    init_db(client)
    
    # Ordem de prioridade para carga
    # Dimensões primeiro -> Fatos depois
    priority_order = ['CNAE', 'MUNIC', 'MOTI', 'NATJU', 'SIMPLES', 'EMPRE', 'SOCIO', 'ESTABELE']
    
    files_found = 0
    
    for file_type in priority_order:
        pattern = os.path.join(abs_data_dir, f"*{file_type}*")
        files = glob.glob(pattern)
        
        # Filtra zips e ordena
        valid_files = sorted([f for f in files if not f.endswith('.zip') and os.path.isfile(f)])
        
        if valid_files:
            print(f"\nCategoria: {file_type} ({len(valid_files)} arquivos)")
            for f in valid_files:
                process_file(f, file_type, client)
                files_found += 1
        
    if files_found == 0:
        print("\nNenhum arquivo CSV compatível encontrado.")
        print("Certifique-se que os arquivos descompactados contêm os nomes padrões (ex: .ESTABELE, .EMPRE, etc).")
    else:
        print(f"\nConcluído com sucesso. {files_found} arquivos processados.")

if __name__ == "__main__":
    main()