import polars as pl
import clickhouse_connect
import os
import glob
import sys

# --- CONFIGURAÇÃO ---
DB_NAME = os.getenv('DB_NAME', 'cnpj_analytics')
DATA_DIR = os.getenv('DATA_DIR', r'W:\app\dados_temp')

# 1. Fonte de Coordenadas (Kelvins - Estável)
URL_KELVINS_MUN = "https://raw.githubusercontent.com/kelvins/municipios-brasileiros/main/csv/municipios.csv"

# 2. Fonte de Tradução (FONTE OFICIAL GOV.BR)
# Este arquivo contém: CÓDIGO TOM (Receita) ; CÓDIGO IBGE ; NOME
URL_MAPPING_OFICIAL = "https://www.gov.br/receitafederal/dados/municipios.csv"

def get_client():
    return clickhouse_connect.get_client(
        host='rpnr0uu71a.eastus2.azure.clickhouse.cloud',
        user='default',
        password='fMfeEsJ.8FkK7',
        secure=True
    )

def main():
    print("\n=== ETL GEOGRÁFICO (FONTE OFICIAL GOV.BR) ===")
    
    # ---------------------------------------------------------
    # 1. Busca arquivo local da Receita (MUNIC)
    # ---------------------------------------------------------
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

    # ---------------------------------------------------------
    # 2. Baixa e Trata o Mapeamento Oficial (Gov.br)
    # ---------------------------------------------------------
    print("-> Baixando tabela oficial (Gov.br)...")
    try:
        # O arquivo do governo usa encoding Latin1 (ISO-8859-1) e separador ;
        # Colunas esperadas: CÓDIGO TOM; CÓDIGO IBGE; NOME; ...
        # Vamos pegar pelo índice para evitar erro de acentuação no header
        df_map = pl.read_csv(
            URL_MAPPING_OFICIAL, 
            separator=';', 
            encoding='latin1', # Padrão Gov.br
            has_header=True,
            infer_schema_length=0 # Lê tudo como string
        )
        
        # Seleciona colunas 0 (TOM) e 1 (IBGE)
        col_tom = df_map.columns[0]
        col_ibge = df_map.columns[1]
        
        df_map = df_map.select([
            pl.col(col_tom).str.strip_chars().str.zfill(4).alias("codigo_rfb"),
            pl.col(col_ibge).str.strip_chars().alias("codigo_ibge")
        ])
        
    except Exception as e:
        print(f"ERRO ao baixar do Gov.br: {e}")
        return

    # ---------------------------------------------------------
    # 3. Baixa Coordenadas (Kelvins)
    # ---------------------------------------------------------
    print("-> Baixando coordenadas (Kelvins)...")
    try:
        df_geo = pl.read_csv(URL_KELVINS_MUN).select([
            pl.col("codigo_ibge").cast(pl.Utf8),
            pl.col("latitude").cast(pl.Float64),
            pl.col("longitude").cast(pl.Float64),
            pl.col("codigo_uf").cast(pl.Utf8)
        ])
    except Exception as e:
        print(f"ERRO ao baixar Kelvins: {e}")
        return

    # ---------------------------------------------------------
    # 4. Cruzamento (Merge)
    # ---------------------------------------------------------
    print("-> Cruzando dados...")

    # Join 1: RFB Local + Mapeamento Oficial (via código TOM)
    df_step1 = df_rfb_local.join(df_map, on="codigo_rfb", how="left")
    
    # Join 2: Resultado + Coordenadas (via código IBGE)
    df_final = df_step1.join(df_geo, on="codigo_ibge", how="left")

    # Preparação final:
    # - Preencher nulos
    # - Criar coluna de tupla (Point) para ClickHouse (Longitude, Latitude)
    df_insert = df_final.select([
        pl.col("codigo_rfb").alias("codigo"),
        pl.col("descricao"),
        pl.col("codigo_ibge").fill_null("0000000"),
        pl.col("codigo_uf").alias("uf").fill_null(""),
        # ClickHouse Point é (x, y) => (Longitude, Latitude)
        pl.concat_list([
            pl.col("longitude").fill_null(0.0), 
            pl.col("latitude").fill_null(0.0)
        ]).alias("coordenadas")
    ])

    # ---------------------------------------------------------
    # 5. Carga no ClickHouse
    # ---------------------------------------------------------
    try:
        client = get_client()
        
        print(f"-> Atualizando tabela dim_municipios ({df_insert.height} linhas)...")
        
        # Garante estrutura alinhada com setup.sql
        # Point armazena (x, y)
        client.command(f"""
            ALTER TABLE {DB_NAME}.dim_municipios 
            ADD COLUMN IF NOT EXISTS codigo_ibge FixedString(7),
            ADD COLUMN IF NOT EXISTS uf FixedString(2),
            ADD COLUMN IF NOT EXISTS coordenadas Point
        """)
        
        client.command(f"TRUNCATE TABLE {DB_NAME}.dim_municipios")
        
        # rows() retorna lista de tuplas/listas. 
        # A coluna 'coordenadas' será uma lista [lon, lat], que o driver converte para Point.
        client.insert(
            f"{DB_NAME}.dim_municipios",
            data=df_insert.rows(),
            column_names=df_insert.columns
        )
        
        print("✅ SUCESSO! Base atualizada com dados oficiais e coordenadas (Point).")

    except Exception as e:
        print(f"ERRO ao inserir no ClickHouse: {e}")

if __name__ == "__main__":
    main()