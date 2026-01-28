"""
etl_v2.py - Pipeline ETL Otimizado - Versão Segura
Adaptação para carregamento de credenciais via .env e criação dinâmica de dicionários
"""

import polars as pl
import clickhouse_connect
import os
import time
import glob
import sys
from datetime import datetime, date
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn, TimeElapsedColumn
from rich.live import Live
from rich.panel import Panel
from rich.layout import Layout
import concurrent.futures
import queue
import logging

# Carrega variáveis de ambiente
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("python-dotenv não instalado. Usando variáveis de ambiente do sistema.")

console = Console()

# ---------------------------------------------------------
# LOGGING SETUP
# ---------------------------------------------------------
def setup_logging():
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_file = os.path.join(log_dir, f"etl_v2_{timestamp}.log")
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
        ]
    )
    console.print(f"[dim]Log file: {log_file}[/dim]")
    return log_file

# ---------------------------------------------------------
# CONFIGURAÇÃO
# ---------------------------------------------------------
DB_NAME = os.getenv('CH_DATABASE', 'cnpj_analytics')
DATA_DIR = os.getenv('DATA_DIR', r'W:\app\dados_temp')
SENTINEL_DATE = date(1900, 1, 1)

# Arquivos separadas para estrutura e views
SETUP_TABLES_FILE = 'setup_tables_v2.sql'
SETUP_VIEWS_FILE = 'setup_views_v2.sql'

FILES_CONFIG = {
    'ESTABELE': {
        'table': 'estabelecimentos',
        'columns': [
            'cnpj_basico', 'cnpj_ordem', 'cnpj_dv', 'identificador_matriz_filial', 
            'nome_fantasia', 'situacao_cadastral', 'data_situacao_cadastral', 
            'cnae_fiscal_principal', 
            'tipo_logradouro', 'logradouro', 'numero', 'complemento', 'bairro', 'cep',
            'uf', 'municipio', 'data_inicio_atividade', 
            'ddd1', 'telefone1', 'correio_eletronico'
        ]
    },
    'MUNIC': {'table': 'dim_municipios', 'columns': ['codigo', 'descricao']},
    'CNAE': {'table': 'dim_cnae', 'columns': ['codigo', 'descricao']},
    'EMPRE': {
        'table': 'empresas',
        'columns': ['cnpj_basico', 'razao_social', 'natureza_juridica', 'capital_social', 'porte_empresa']
    },
    'SOCIO': {
        'table': 'socios',
        'columns': ['cnpj_basico', 'identificador_socio', 'nome_socio', 'cnpj_cpf_socio', 'qualificacao_socio', 'data_entrada_sociedade', 'pais', 'faixa_etaria']
    },
    'MOTI': {'table': 'dim_motivos', 'columns': ['codigo', 'descricao']},
    'NATJU': {'table': 'dim_naturezas_juridicas', 'columns': ['codigo', 'descricao']},
    'SIMPLES': {
        'table': 'simples',
        'columns': ['cnpj_basico', 'opcao_pelo_simples', 'data_opcao_simples', 'data_exclusao_simples', 'opcao_pelo_mei', 'data_opcao_mei', 'data_exclusao_mei']
    }
}

# ---------------------------------------------------------
# FUNÇÕES DE BANCO DE DADOS
# ---------------------------------------------------------
def get_client(apply_memory_settings=False):
    """Conexão segura usando Variáveis de Ambiente.
    
    Args:
        apply_memory_settings: Se True, aplica configurações de proteção contra OOM.
    """
    retries = 5
    
    host = os.getenv('CH_HOST', 'rpnr0uu71a.eastus2.azure.clickhouse.cloud')
    user = os.getenv('CH_USER', 'default')
    password = os.getenv('CH_PASSWORD')
    port = int(os.getenv('CH_PORT', 9440))
    
    if not password:
        console.print("[bold red]ERRO: Variável CH_PASSWORD não definida![/bold red]")
        sys.exit(1)

    while retries > 0:
        try:
            client = clickhouse_connect.get_client(
                host=host,
                port=port,
                user=user,
                password=password,
                secure=True,
                connect_timeout=30,
                send_receive_timeout=300
            )
            
            # Configurações de proteção contra OOM (spill-to-disk)
            if apply_memory_settings:
                memory_settings = [
                    "SET max_bytes_before_external_group_by = 10000000000",  # 10GB
                    "SET max_bytes_before_external_sort = 10000000000",      # 10GB
                    "SET join_use_nulls = 0",                                 # Evita overhead de Nullable
                    "SET join_algorithm = 'auto'",                            # Permite grace_hash automático
                ]
                for setting in memory_settings:
                    try:
                        client.command(setting)
                    except Exception as e:
                        logging.warning(f"Não foi possível aplicar setting: {setting} - {e}")
            
            return client
        except Exception as e:
            console.print(f"[yellow]Retrying connection... ({e})[/yellow]")
            time.sleep(5)
            retries -= 1
    raise Exception("Falha crítica de conexão ClickHouse.")

def execute_sql_file(client, filename):
    script_path = os.path.join(os.path.dirname(__file__), filename)
    if not os.path.exists(script_path):
        logging.error(f"Arquivo {filename} não encontrado.")
        sys.exit(1)
        
    logging.info(f"Executando {filename}...")
    with open(script_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()
        lines = [line for line in sql_content.split('\n') if not line.strip().startswith('--')]
        full_sql = '\n'.join(lines)
        commands = [c.strip() for c in full_sql.split(';') if c.strip()]
        
        for cmd in commands:
            if len(cmd) < 5: continue
            try:
                client.command(cmd)
            except Exception as e:
                # 'Table ... already exists' ou 'View ... already exists'
                if "already exists" not in str(e):
                    logging.warning(f"Erro SQL em {filename}: {e}")

def create_dictionaries(client):
    """Cria dicionários programaticamente usando credenciais do ambiente.
    
    Otimização de Memória: Usando HASHED ao invés de COMPLEX_KEY_HASHED
    para chaves simples - reduz overhead de RAM significativamente.
    """
    console.print("[cyan]Criando Dicionários Otimizados...[/cyan]")
    
    host = os.getenv('CH_HOST', 'rpnr0uu71a.eastus2.azure.clickhouse.cloud')
    user = os.getenv('CH_USER', 'default')
    password = os.getenv('CH_PASSWORD')
    port = os.getenv('CH_PORT', '9440')
    
    # Tupla: (nome, tabela, colunas, pk, layout)
    # HASHED: Para chaves simples (String/Int) - menor overhead de memória
    # COMPLEX_KEY_HASHED: Apenas para chaves compostas
    dictionaries = [
        ("dict_cnae", "dim_cnae", "codigo String, descricao String", "codigo", "HASHED()"),
        ("dict_municipios", "dim_municipios", "codigo FixedString(4), descricao String, uf FixedString(2)", "codigo", "HASHED()"),
        ("dict_naturezas_juridicas", "dim_naturezas_juridicas", "codigo String, descricao String", "codigo", "HASHED()"),
        ("dict_motivos", "dim_motivos", "codigo String, descricao String", "codigo", "HASHED()"),
    ]
    
    for dict_name, table_name, columns, pk, layout in dictionaries:
        query = f"""
        CREATE OR REPLACE DICTIONARY {DB_NAME}.{dict_name}
        ({columns})
        PRIMARY KEY {pk}
        SOURCE(CLICKHOUSE(
            HOST '{host}' PORT {port}
            USER '{user}' PASSWORD '{password}'
            TABLE '{table_name}' DB '{DB_NAME}'
            SECURE 1
        ))
        LIFETIME(MIN 0 MAX 3600)
        LAYOUT({layout})
        """
        try:
            client.command(query)
            logging.info(f"Dicionário {dict_name} criado/atualizado com layout {layout}.")
        except Exception as e:
            logging.error(f"Erro criando dicionário {dict_name}: {e}")

# ---------------------------------------------------------
# PIPELINE DE DADOS (POLARS)
# ---------------------------------------------------------
def process_file(filepath, file_type, client, progress, overall_task, file_summary, ui_callback=None):
    config = FILES_CONFIG[file_type]
    table_name = f'{DB_NAME}.{config["table"]}'
    filename = os.path.basename(filepath)
    
    start_time = datetime.now()
    file_record = {
        "file": filename, "type": file_type, 
        "start": start_time.strftime("%H:%M:%S"), "end": "-", 
        "rows_read": 0, "rows_inserted": 0, 
        "status": "[yellow]Iniciando...[/yellow]"
    }
    file_summary.append(file_record)
    if ui_callback: ui_callback()

    q = pl.scan_csv(
        filepath, 
        separator=';', 
        has_header=False,
        encoding='utf8-lossy', 
        quote_char='"', 
        ignore_errors=True, 
        truncate_ragged_lines=True, 
        infer_schema_length=0
    )

    # Transformações
    if file_type == 'ESTABELE':
        q = q.select([
            pl.col("column_1").alias("cnpj_basico"),
            pl.col("column_2").alias("cnpj_ordem"),
            pl.col("column_3").alias("cnpj_dv"),
            pl.col("column_4").alias("identificador_matriz_filial"),
            pl.col("column_5").str.strip_chars().fill_null("").alias("nome_fantasia"),
            pl.col("column_6").alias("situacao_cadastral"),
            pl.col("column_7").alias("data_situacao_cadastral"),
            pl.col("column_11").alias("data_inicio_atividade"),
            pl.col("column_12").alias("cnae_fiscal_principal"),
            pl.col("column_14").str.strip_chars().fill_null("").alias("tipo_logradouro"),
            pl.col("column_15").str.strip_chars().fill_null("").alias("logradouro"),
            pl.col("column_16").str.strip_chars().fill_null("").alias("numero"),
            pl.col("column_17").str.strip_chars().fill_null("").alias("complemento"),
            pl.col("column_18").str.strip_chars().fill_null("").alias("bairro"),
            pl.col("column_19").str.replace(r"\D", "").fill_null("").alias("cep"),
            pl.col("column_20").alias("uf"),
            pl.col("column_21").fill_null("").alias("municipio"),
            pl.col("column_22").fill_null("").alias("ddd1"),
            pl.col("column_23").fill_null("").alias("telefone1"),
            pl.col("column_28").str.strip_chars().fill_null("").alias("correio_eletronico")
        ]).with_columns([
            pl.col("data_situacao_cadastral").str.to_date("%Y%m%d", strict=False).fill_null(pl.lit(SENTINEL_DATE)),
            pl.col("data_inicio_atividade").str.to_date("%Y%m%d", strict=False).fill_null(pl.lit(SENTINEL_DATE))
        ])
    elif file_type == 'EMPRE':
        q = q.select([
            pl.col("column_1").alias("cnpj_basico"),
            pl.col("column_2").str.strip_chars().fill_null("").alias("razao_social"),
            pl.col("column_3").alias("natureza_juridica"),
            pl.col("column_5").alias("capital_social"),
            pl.col("column_6").alias("porte_empresa")
        ]).with_columns([
            pl.col("capital_social").str.replace(",", ".").cast(pl.Float64, strict=False).fill_null(0.0)
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
            pl.col("data_entrada_sociedade").str.to_date("%Y%m%d", strict=False).fill_null(pl.lit(SENTINEL_DATE))
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
            pl.col("data_opcao_simples").str.to_date("%Y%m%d", strict=False).fill_null(pl.lit(SENTINEL_DATE)),
            pl.col("data_exclusao_simples").str.to_date("%Y%m%d", strict=False).fill_null(pl.lit(SENTINEL_DATE)),
            pl.col("data_opcao_mei").str.to_date("%Y%m%d", strict=False).fill_null(pl.lit(SENTINEL_DATE)),
            pl.col("data_exclusao_mei").str.to_date("%Y%m%d", strict=False).fill_null(pl.lit(SENTINEL_DATE))
        ])
    elif file_type in ['MUNIC', 'CNAE', 'MOTI', 'NATJU']:
        q = q.select([
            pl.col("column_1").alias("codigo"),
            pl.col("column_2").str.strip_chars().fill_null("").alias("descricao")
        ])

    try:
        BATCH_SIZE = 50000 
        processed_batches = q.collect(streaming=True)
        total_rows = processed_batches.height
        file_record["rows_read"] = total_rows
        rows_inserted = 0
        
        if total_rows == 0:
            file_record["status"] = "[white]Vazio[/white]"
            file_record["end"] = datetime.now().strftime("%H:%M:%S")
            logging.info(f"{filename}: 0 linhas lidas, 0 inseridas")
            return

        file_task = progress.add_task(f"[cyan]{filename}", total=total_rows)
        file_record["status"] = "[blue]Processando...[/blue]"
        if ui_callback: ui_callback()
        
        for i in range(0, total_rows, BATCH_SIZE):
            batch = processed_batches.slice(i, BATCH_SIZE)
            batch_rows = batch.height
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    client.insert(table_name, batch.rows(), column_names=batch.columns)
                    rows_inserted += batch_rows
                    break
                except Exception as e:
                    if attempt < max_retries - 1: time.sleep(5)
                    else: raise e
            
            progress.update(file_task, advance=batch_rows)
            if ui_callback: ui_callback()
        
        file_record["rows_inserted"] = rows_inserted
        file_record["status"] = "[green]Sucesso[/green]"
        file_record["end"] = datetime.now().strftime("%H:%M:%S")
        logging.info(f"{filename}: {total_rows:,} lidas, {rows_inserted:,} inseridas")
        if ui_callback: ui_callback()
        progress.remove_task(file_task)
        progress.update(overall_task, advance=1)
        
    except Exception as e:
        file_record["status"] = f"[red]Erro[/red]"
        file_record["end"] = datetime.now().strftime("%H:%M:%S")
        logging.error(f"Erro processando {filename}: {e}", exc_info=True)
        if ui_callback: ui_callback()


def print_final_summary(file_summary):
    """Exibe resumo final com totais de linhas lidas e inseridas."""
    console.print("\n")
    
    summary_table = Table(title="[bold]Resumo Final do ETL[/bold]", expand=True)
    summary_table.add_column("Arquivo", style="cyan", no_wrap=True)
    summary_table.add_column("Tipo", style="dim")
    summary_table.add_column("Lidas", justify="right", style="yellow")
    summary_table.add_column("Inseridas", justify="right", style="green")
    summary_table.add_column("Status")
    summary_table.add_column("Duração", justify="right")
    
    total_read = 0
    total_inserted = 0
    
    for f in file_summary:
        total_read += f.get("rows_read", 0)
        total_inserted += f.get("rows_inserted", 0)
        summary_table.add_row(
            f["file"][:40] + "..." if len(f["file"]) > 40 else f["file"],
            f["type"],
            f"{f.get('rows_read', 0):,}",
            f"{f.get('rows_inserted', 0):,}",
            f["status"],
            f"{f['start']} → {f['end']}"
        )
    
    # Linha de totais
    summary_table.add_section()
    summary_table.add_row(
        "[bold]TOTAL[/bold]", "",
        f"[bold yellow]{total_read:,}[/bold yellow]",
        f"[bold green]{total_inserted:,}[/bold green]",
        "", ""
    )
    
    console.print(summary_table)
    logging.info(f"TOTAL: {total_read:,} linhas lidas, {total_inserted:,} inseridas")

# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------
def main():
    abs_data_dir = os.path.abspath(DATA_DIR)
    if not os.path.exists(abs_data_dir):
        console.print(f"[red]Diretório {abs_data_dir} não encontrado![/red]")
        return

    log_file = setup_logging()
    
    # 1. Configura Banco
    console.print("[blue]Conectando ao ClickHouse...[/blue]")
    client = get_client()
    execute_sql_file(client, SETUP_TABLES_FILE)
    
    # 2. Processa Arquivos
    priority_order = ['CNAE', 'MUNIC', 'MOTI', 'NATJU', 'SIMPLES', 'EMPRE', 'SOCIO', 'ESTABELE']
    all_valid_files = []
    
    # Busca arquivos
    for file_type in priority_order:
        pattern = os.path.join(abs_data_dir, f"*{file_type}*")
        files = glob.glob(pattern)
        valid = sorted([f for f in files if not f.endswith('.zip') and os.path.isfile(f)])
        for f in valid:
            all_valid_files.append((f, file_type))
            
    if not all_valid_files:
        console.print("[yellow]Nenhum arquivo CSV encontrado.[/yellow]")
        return

    file_summary = []
    progress = Progress(
        SpinnerColumn(), TextColumn("[progress.description]{task.description}"),
        BarColumn(), TaskProgressColumn(), TextColumn("{task.completed}/{task.total} ({task.percentage:>3.0f}%)"),
        TimeElapsedColumn(), console=console
    )

    layout = Layout()
    layout.split_column(Layout(name="header", size=3), Layout(name="body"), Layout(name="footer", size=10))
    layout["header"].update(Panel("[bold white]CNPJ ETL V2 (SECURE)[/bold white]", style="blue"))

    try:
        with Live(layout, console=console, refresh_per_second=4):
            overall_task = progress.add_task("[bold green]Total", total=len(all_valid_files))
            layout["footer"].update(Panel(progress, title="Progresso"))
            
            # Fila de prioridade
            work_queue = queue.PriorityQueue()
            for f_path, f_type in all_valid_files:
                if f_type in ['CNAE', 'MUNIC', 'MOTI', 'NATJU']: priority = 1
                elif f_type in ['SIMPLES', 'EMPRE', 'SOCIO']: priority = 2
                else: priority = 3
                work_queue.put((priority, f_path, f_type))

            def refresh_ui():
                # Tabela com colunas de debug
                table = Table(title="Status", expand=True)
                table.add_column("Arquivo", no_wrap=True)
                table.add_column("Lidas", justify="right")
                table.add_column("Inseridas", justify="right")
                table.add_column("Status")
                for f in file_summary[-10:]:
                    table.add_row(
                        f["file"][:35],
                        f"{f.get('rows_read', 0):,}",
                        f"{f.get('rows_inserted', 0):,}",
                        f["status"]
                    )
                layout["body"].update(table)

            # Workers
            def worker_process():
                local_client = get_client()
                while True:
                    try:
                        _, fp, ft = work_queue.get(timeout=1)
                        process_file(fp, ft, local_client, progress, overall_task, file_summary, refresh_ui)
                        work_queue.task_done()
                    except queue.Empty:
                        break

            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = [executor.submit(worker_process) for _ in range(3)]
                for f in concurrent.futures.as_completed(futures):
                    f.result()

        # 3. Pós-Processamento (Dicionários + Views)
        console.print("\n[bold cyan]Carga de dados concluída. Configurando Metadata...[/bold cyan]")
        create_dictionaries(client)
        execute_sql_file(client, SETUP_VIEWS_FILE)
        
        # 4. Resumo Final
        print_final_summary(file_summary)
        
        console.print("\n[bold green]✅ ETL Finalizado com Sucesso![/bold green]")

    except Exception as e:
        console.print(f"[bold red]Erro Fatal: {e}[/bold red]")
        import traceback
        console.print(traceback.format_exc())

if __name__ == "__main__":
    main()
