"""
dimensoes_geo.py - ETL Geográfico Unificado
Popula dim_estados e dim_municipios com dados enriquecidos:
  - Coordenadas (Kelvins/GitHub)
  - Bandeiras dos estados (Codante API)
  - Mapeamento RFB → IBGE (Gov.br)
"""

import polars as pl
import clickhouse_connect
import os
import glob
import sys
import logging
from datetime import datetime
from rich.console import Console
from rich.panel import Panel

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

console = Console()

# ---------------------------------------------------------
# CONFIGURAÇÃO — alinhada com populate.py e .env
# ---------------------------------------------------------
DB_NAME  = os.getenv('CH_DATABASE', 'cnpj_silver')
DATA_DIR = os.getenv('DATA_DIR', r'W:\app\dados_temp')

# URLs externas
URL_ESTADOS_FLAGS     = "https://apis.codante.io/bandeiras-dos-estados"
URL_ESTADOS_CSV       = "https://raw.githubusercontent.com/kelvins/municipios-brasileiros/503e2f70bbf1b4b7ec0b1f68b09086ccc38fe861/csv/estados.csv"
URL_MUNICIPIOS_KELVINS = "https://raw.githubusercontent.com/kelvins/municipios-brasileiros/main/csv/municipios.csv"
URL_MAPPING_OFICIAL   = "https://www.gov.br/receitafederal/dados/municipios.csv"

# ---------------------------------------------------------
# LOGGING — mesmo padrão do populate.py
# ---------------------------------------------------------
def setup_logging():
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_file = os.path.join(log_dir, f"geo_{timestamp}.log")

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    fh = logging.FileHandler(log_file, encoding='utf-8')
    fh.setFormatter(logging.Formatter(
        '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
    ))
    logger.addHandler(fh)
    console.print(f"[dim]📜 Log: {log_file}[/dim]")

# ---------------------------------------------------------
# CONEXÃO — consistente com populate.py (HTTP/8443)
# ---------------------------------------------------------
def get_client():
    host     = os.getenv('CH_HOST')
    user     = os.getenv('CH_USER', 'default')
    password = os.getenv('CH_PASSWORD')
    port     = int(os.getenv('CH_PORT', 8443))

    if not password:
        console.print("[bold red]ERRO: CH_PASSWORD não definido no .env![/bold red]")
        sys.exit(1)

    return clickhouse_connect.get_client(
        host=host,
        port=port,
        username=user,
        password=password,
        secure=True,
        connect_timeout=30,
        send_receive_timeout=120
    )

# ---------------------------------------------------------
# HELPER: INSERT seguro (trunca só se tiver dados novos)
# ---------------------------------------------------------
def safe_replace(client, table: str, df: pl.DataFrame, rows_to_insert: list):
    """Só trunca e insere se houver dados. Evita perda em caso de falha de download."""
    if not rows_to_insert:
        logging.warning(f"safe_replace: sem dados para {table}, operação abortada.")
        console.print(f"[yellow]⚠️  Sem dados para {table}. Tabela não alterada.[/yellow]")
        return False

    try:
        client.command(f"TRUNCATE TABLE {table}")
        client.insert(table, data=rows_to_insert, column_names=df.columns)
        logging.info(f"{table}: {len(rows_to_insert)} linhas inseridas.")
        console.print(f"[green]✅ {table} — {len(rows_to_insert):,} linhas inseridas.[/green]")
        return True
    except Exception as e:
        logging.error(f"Erro ao inserir em {table}: {e}")
        console.print(f"[bold red]❌ Erro em {table}: {e}[/bold red]")
        return False

# =============================================================================
# ESTADOS
# =============================================================================
def process_estados(client):
    console.print("\n[bold cyan]>>> ESTADOS (dim_estados)[/bold cyan]")
    logging.info("Iniciando process_estados")

    # 1. Bandeiras (API JSON)
    df_flags = pl.DataFrame(schema={"sigla": pl.Utf8, "flag_url": pl.Utf8})
    try:
        import requests
        console.print("[dim]  → Baixando bandeiras (Codante)...[/dim]")
        resp = requests.get(URL_ESTADOS_FLAGS, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if data:
            df_flags = pl.DataFrame(data).select([
                pl.col("uf").alias("sigla"),
                pl.col("flag_url")
            ])
        logging.info(f"Bandeiras: {df_flags.height} registros.")
    except Exception as e:
        logging.warning(f"Bandeiras indisponíveis: {e}")
        console.print(f"[yellow]  ⚠️  Bandeiras indisponíveis: {e}[/yellow]")

    # 2. Dados gerais (CSV Kelvins)
    console.print("[dim]  → Baixando dados gerais (Kelvins)...[/dim]")
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
        logging.error(f"Falha ao baixar CSV de estados: {e}")
        console.print(f"[bold red]  ❌ Falha ao baixar estados: {e}[/bold red]")
        return

    # 3. Join e preparação
    df_final = df_csv.join(df_flags, on="sigla", how="left")
    df_insert = df_final.select([
        pl.col("codigo_uf"),
        pl.col("nome"),
        pl.col("sigla"),
        pl.col("flag_url").fill_null(""),
        pl.col("regiao").fill_null(""),
        pl.concat_list([
            pl.col("longitude").fill_null(0.0),
            pl.col("latitude").fill_null(0.0)
        ]).alias("coordenadas")
    ])

    rows = [
        (row[0], row[1], row[2], row[3], row[4], tuple(row[5]))
        for row in df_insert.rows()
    ]

    safe_replace(client, f"{DB_NAME}.dim_estados", df_insert, rows)

# =============================================================================
# MUNICÍPIOS
# =============================================================================
def process_municipios(client):
    console.print("\n[bold cyan]>>> MUNICÍPIOS (dim_municipios)[/bold cyan]")
    logging.info("Iniciando process_municipios")

    # 1. Arquivo local da Receita (MUNIC)
    abs_data_dir = os.path.abspath(DATA_DIR)
    pattern = os.path.join(abs_data_dir, "*MUNIC*")
    files = [f for f in glob.glob(pattern) if not f.endswith('.zip') and os.path.isfile(f)]

    if not files:
        console.print(f"[bold red]  ❌ Arquivo MUNIC não encontrado em {abs_data_dir}[/bold red]")
        logging.error(f"Arquivo MUNIC não encontrado em {abs_data_dir}")
        return

    console.print(f"[dim]  → Lendo MUNIC local: {os.path.basename(files[0])}[/dim]")
    try:
        # has_header=False: usa column_1, column_2 (mesmo padrão do populate.py)
        df_rfb = pl.read_csv(
            files[0],
            separator=';',
            has_header=False,
            encoding='utf8-lossy',
            quote_char='"',
            truncate_ragged_lines=True,
            infer_schema_length=0
        ).select([
            pl.col("column_1").str.strip_chars().str.zfill(4).alias("codigo_rfb"),
            pl.col("column_2").str.strip_chars().alias("descricao")
        ])
        logging.info(f"MUNIC local: {df_rfb.height} registros.")
    except Exception as e:
        logging.error(f"Falha ao ler MUNIC: {e}")
        console.print(f"[bold red]  ❌ Falha ao ler MUNIC: {e}[/bold red]")
        return

    # 2. Mapeamento RFB → IBGE (Gov.br)
    console.print("[dim]  → Baixando mapeamento RFB→IBGE (Gov.br)...[/dim]")
    try:
        df_map_raw = pl.read_csv(
            URL_MAPPING_OFICIAL,
            separator=';',
            encoding='latin1',
            has_header=True,
            infer_schema_length=0
        )
        col_tom  = df_map_raw.columns[0]
        col_ibge = df_map_raw.columns[1]
        df_map = df_map_raw.select([
            pl.col(col_tom).str.strip_chars().str.zfill(4).alias("codigo_rfb"),
            pl.col(col_ibge).str.strip_chars().alias("codigo_ibge")
        ])
        logging.info(f"Mapeamento RFB→IBGE: {df_map.height} registros.")
    except Exception as e:
        logging.warning(f"Mapeamento Gov.br indisponível: {e}")
        console.print(f"[yellow]  ⚠️  Mapeamento Gov.br indisponível: {e}[/yellow]")
        df_map = pl.DataFrame(schema={"codigo_rfb": pl.Utf8, "codigo_ibge": pl.Utf8})

    # 3. Coordenadas (Kelvins)
    console.print("[dim]  → Baixando coordenadas (Kelvins)...[/dim]")
    try:
        df_geo = pl.read_csv(URL_MUNICIPIOS_KELVINS).select([
            pl.col("codigo_ibge").cast(pl.Utf8),
            pl.col("latitude").cast(pl.Float64),
            pl.col("longitude").cast(pl.Float64),
            pl.col("codigo_uf").cast(pl.Utf8)
        ])
        logging.info(f"Coordenadas: {df_geo.height} registros.")
    except Exception as e:
        logging.warning(f"Coordenadas Kelvins indisponíveis: {e}")
        console.print(f"[yellow]  ⚠️  Coordenadas indisponíveis: {e}[/yellow]")
        df_geo = pl.DataFrame(schema={
            "codigo_ibge": pl.Utf8,
            "latitude": pl.Float64,
            "longitude": pl.Float64,
            "codigo_uf": pl.Utf8
        })

    # 4. Cruzamento em cascata
    console.print("[dim]  → Cruzando dados...[/dim]")
    df_step1 = df_rfb.join(df_map, on="codigo_rfb", how="left")
    df_final = df_step1.join(df_geo, on="codigo_ibge", how="left")

    df_insert = df_final.select([
        pl.col("codigo_rfb").alias("codigo"),
        pl.col("descricao").fill_null(""),
        pl.col("codigo_ibge").fill_null("0000000"),
        pl.col("codigo_uf").alias("uf").fill_null(""),
        pl.concat_list([
            pl.col("longitude").fill_null(0.0),
            pl.col("latitude").fill_null(0.0)
        ]).alias("coordenadas")
    ])

    rows = [
        (row[0], row[1], row[2], row[3], tuple(row[4]))
        for row in df_insert.rows()
    ]

    safe_replace(client, f"{DB_NAME}.dim_municipios", df_insert, rows)

# =============================================================================
# MAIN
# =============================================================================
def main():
    setup_logging()
    console.print(Panel(
        f"[bold white]ETL GEOGRÁFICO[/bold white]\n[dim]DB: {DB_NAME} | Dir: {DATA_DIR}[/dim]",
        style="blue"
    ))
    logging.info("ETL Geográfico iniciado")

    try:
        client = get_client()
        process_estados(client)
        process_municipios(client)
        console.print("\n[bold green]✅ ETL Geográfico concluído![/bold green]")
        logging.info("ETL Geográfico concluído com sucesso.")
    except Exception as e:
        logging.error(f"Erro fatal: {e}", exc_info=True)
        console.print(f"[bold red]ERRO FATAL: {e}[/bold red]")

if __name__ == "__main__":
    main()
