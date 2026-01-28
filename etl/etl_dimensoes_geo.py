import polars as pl
import clickhouse_connect
import os
import glob
import sys

# --- CONFIGURAÇÃO ---
DB_NAME = os.getenv('DB_NAME', 'cnpj_analytics')
DATA_DIR = os.getenv('DATA_DIR', r'W:\app\dados_temp')

# --- URLS ---
# 1. Estados
URL_ESTADOS_FLAGS = "https://apis.codante.io/bandeiras-dos-estados"
# Usando Raw do Github para garantir o download correto do CSV
URL_ESTADOS_CSV = "https://raw.githubusercontent.com/kelvins/municipios-brasileiros/503e2f70bbf1b4b7ec0b1f68b09086ccc38fe861/csv/estados.csv"

# 2. Municípios
URL_MUNICIPIOS_KELVINS = "https://raw.githubusercontent.com/kelvins/municipios-brasileiros/main/csv/municipios.csv"
URL_MAPPING_OFICIAL = "https://www.gov.br/receitafederal/dados/municipios.csv"

def get_client():
    return clickhouse_connect.get_client(
        host='rpnr0uu71a.eastus2.azure.clickhouse.cloud',
        user='default',
        password='fMfeEsJ.8FkK7',
        secure=True
    )

# =============================================================================
# PROCESSAMENTO DE ESTADOS
# =============================================================================
def process_estados(client):
    print("\n------------------------------------------------")
    print(">>> PROCESSANDO ESTADOS (dim_estados)")
    print("------------------------------------------------")

    # 1. Busca Bandeiras (JSON)
    print("-> Baixando Bandeiras (Codante)...")
    df_flags = pl.DataFrame(schema={"sigla": pl.Utf8, "flag_url": pl.Utf8})
    try:
        # Polars lê JSON, mas a API retorna uma lista de objetos.
        # Vamos ler direto da URL.
        import requests
        resp = requests.get(URL_ESTADOS_FLAGS, timeout=10)
        resp.raise_for_status()
        data_flags = resp.json()
        
        if data_flags:
            df_flags = pl.DataFrame(data_flags).select([
                pl.col("uf").alias("sigla"),
                pl.col("flag_url")
            ])
    except Exception as e:
        print(f"AVISO: Não foi possível baixar bandeiras: {e}. Continuando sem elas.")

    # 2. Busca Dados Gerais (CSV Kelvins)
    print("-> Baixando Dados Gerais (Kelvins)...")
    try:
        df_csv = pl.read_csv(URL_ESTADOS_CSV).select([
            pl.col("codigo_uf").cast(pl.UInt8),
            pl.col("uf").alias("sigla"),
            pl.col("nome"),
            pl.col("latitude").cast(pl.Float64),
            pl.col("longitude").cast(pl.Float64),
            pl.col("regiao")
        ])
    except Exception as e:
        print(f"ERRO ao baixar CSV de estados: {e}")
        return

    # 3. Join e Tratamento
    print("-> Unificando dados...")
    df_final = df_csv.join(df_flags, on="sigla", how="left")

    # Prepara para ClickHouse
    df_insert = df_final.select([
        pl.col("codigo_uf"),
        pl.col("nome"),
        pl.col("sigla"),
        pl.col("flag_url").fill_null(""),
        pl.col("regiao").fill_null(""),
        # Point(x, y) = (longitude, latitude)
        pl.concat_list([
            pl.col("longitude").fill_null(0.0), 
            pl.col("latitude").fill_null(0.0)
        ]).alias("coordenadas")
    ])

    # 4. Carga no CLickHouse
    print(f"-> Atualizando tabela dim_estados ({df_insert.height} linhas)...")
    
    # DDL
    print("-> (Nota: A tabela dim_estados deve ser criada pelo setup.sql)")

    # Truncate e Insert
    print("-> Truncando e inserindo...")
    client.command(f"TRUNCATE TABLE {DB_NAME}.dim_estados")
    
    try:
        # Convertemos para lista de tuplas para garantir compatibilidade com Point
        # e evitar problemas com listas do Polars no driver pure-python
        rows_to_insert = [
            (
                row[0], # codigo_uf
                row[1], # nome
                row[2], # sigla
                row[3], # flag_url
                row[4], # regiao
                tuple(row[5]) # coordenadas (lon, lat)
            ) for row in df_insert.rows()
        ]

        client.insert(
            f"{DB_NAME}.dim_estados",
            data=rows_to_insert,
            column_names=df_insert.columns
        )
        print("✅ SUCESSO: dim_estados atualizada.")
    except Exception as e:
        print(f"❌ ERRO ao inserir dim_estados: {e}")

# =============================================================================
# PROCESSAMENTO DE MUNICÍPIOS
# =============================================================================
def process_municipios(client):
    print("\n------------------------------------------------")
    print(">>> PROCESSANDO MUNICÍPIOS (dim_municipios)")
    print("------------------------------------------------")
    
    # 1. Busca arquivo local da Receita (MUNIC)
    pattern = os.path.join(DATA_DIR, "*MUNIC*")
    files = [f for f in glob.glob(pattern) if not f.endswith('.zip') and os.path.isfile(f)]
    
    if not files:
        print(f"ERRO: Arquivo MUNIC não encontrado em {DATA_DIR}")
        return
    
    print(f"-> Lendo MUNIC local: {os.path.basename(files[0])}")
    try:
        df_rfb_local = pl.read_csv(
            files[0], 
            separator=';', has_header=False, encoding='latin1', quote_char='"',
            new_columns=['codigo_rfb', 'descricao'],
            try_parse_dates=False
        ).select([
            pl.col("codigo_rfb").cast(pl.Utf8).str.zfill(4),
            pl.col("descricao")
        ])
    except Exception as e:
        print(f"ERRO ao ler arquivo MUNIC: {e}")
        return

    # 2. Baixa e Trata o Mapeamento Oficial (Gov.br)
    print("-> Baixando tabela oficial (Gov.br)...")
    try:
        df_map = pl.read_csv(
            URL_MAPPING_OFICIAL, 
            separator=';', 
            encoding='latin1', 
            has_header=True,
            infer_schema_length=0
        )
        col_tom = df_map.columns[0]
        col_ibge = df_map.columns[1]
        
        df_map = df_map.select([
            pl.col(col_tom).str.strip_chars().str.zfill(4).alias("codigo_rfb"),
            pl.col(col_ibge).str.strip_chars().alias("codigo_ibge")
        ])
    except Exception as e:
        print(f"ERRO ao baixar do Gov.br: {e}")
        return

    # 3. Baixa Coordenadas (Kelvins)
    print("-> Baixando coordenadas (Kelvins)...")
    try:
        df_geo = pl.read_csv(URL_MUNICIPIOS_KELVINS).select([
            pl.col("codigo_ibge").cast(pl.Utf8),
            pl.col("latitude").cast(pl.Float64),
            pl.col("longitude").cast(pl.Float64),
            pl.col("codigo_uf").cast(pl.Utf8)
        ])
    except Exception as e:
        print(f"ERRO ao baixar Kelvins: {e}")
        return

    # 4. Cruzamento
    print("-> Cruzando dados...")
    df_step1 = df_rfb_local.join(df_map, on="codigo_rfb", how="left")
    df_final = df_step1.join(df_geo, on="codigo_ibge", how="left")

    df_insert = df_final.select([
        pl.col("codigo_rfb").alias("codigo"),
        pl.col("descricao").fill_null(""),
        pl.col("codigo_ibge").fill_null("0000000"),
        pl.col("codigo_uf").alias("uf").fill_null(""),
        # ClickHouse Point é (x, y)
        pl.concat_list([
            pl.col("longitude").fill_null(0.0), 
            pl.col("latitude").fill_null(0.0)
        ]).alias("coordenadas")
    ])

    # 5. Carga no ClickHouse
    print(f"-> Atualizando tabela dim_municipios ({df_insert.height} linhas)...")
    try:
        # Garante estrutura (Nota: idealmente gerenciado pelo setup.sql)
        pass
        
        print("-> Truncando e inserindo...")
        client.command(f"TRUNCATE TABLE {DB_NAME}.dim_municipios")
        
        # Convertemos para lista de tuplas para evitar problemas com listas do Polars
        rows_to_insert = [
            (
                row[0], # codigo
                row[1], # descricao
                row[2], # codigo_ibge
                row[3], # uf
                tuple(row[4]) # coordenadas (lon, lat)
            ) for row in df_insert.rows()
        ]

        client.insert(
            f"{DB_NAME}.dim_municipios",
            data=rows_to_insert,
            column_names=df_insert.columns
        )
        print("✅ SUCESSO: dim_municipios atualizada.")

    except Exception as e:
        print(f"❌ ERRO ao inserir dim_municipios: {e}")

# =============================================================================
# MAIN
# =============================================================================
def main():
    print("\n=== ETL GEOGRÁFICO UNIFICADO ===")
    
    try:
        client = get_client()
        # Executa processos
        process_estados(client)
        process_municipios(client)
        
    except Exception as e:
        print(f"ERRO DE CONEXÃO: {e}")

if __name__ == "__main__":
    main()
