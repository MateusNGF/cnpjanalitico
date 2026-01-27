import polars as pl
import clickhouse_connect
import os
import time
import glob
import sys
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn, TimeElapsedColumn
from rich.live import Live
from rich.panel import Panel
from rich.layout import Layout
import concurrent.futures
import queue

console = Console()


# ---------------------------------------------------------
# CONFIGURAÇÃO
# ---------------------------------------------------------
# Configuração alinhada EXATAMENTE com setup_optimized.sql

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
            'cnae_fiscal_principal', 
            'tipo_logradouro', 'logradouro', 'numero', 'complemento', 'bairro', 'cep',
            'uf', 'municipio', 'data_inicio_atividade', 
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
def process_file(filepath, file_type, client, progress, overall_task, file_summary, ui_callback=None):
    config = FILES_CONFIG[file_type]
    table_name = f'{DB_NAME}.{config["table"]}'
    filename = os.path.basename(filepath)
    
    start_time = datetime.now()
    file_record = {
        "file": filename,
        "type": file_type,
        "start": start_time.strftime("%H:%M:%S"),
        "end": "-",
        "rows": 0,
        "status": "[yellow]Iniciando...[/yellow]"
    }
    file_summary.append(file_record)
    if ui_callback: ui_callback()

    # Lazy Frame: Não carrega nada na memória ainda
    q = pl.scan_csv(
        filepath, 
        separator=';', 
        has_header=False, 
        encoding='iso-8859-1', 
        quote_char='"',
        ignore_errors=True,
        truncate_ragged_lines=True,
        infer_schema_length=0 # Força tudo como String
    )

    # Transformações específicas por tipo de arquivo
    if file_type == 'ESTABELE':
        q = q.select([
            pl.col("column_1").alias("cnpj_basico"),
            pl.col("column_2").alias("cnpj_ordem"),
            pl.col("column_3").alias("cnpj_dv"),
            pl.col("column_4").alias("identificador_matriz_filial"),
            pl.col("column_5").str.strip_chars().alias("nome_fantasia"),
            pl.col("column_6").alias("situacao_cadastral"),
            pl.col("column_7").alias("data_situacao_cadastral"),
            pl.col("column_11").alias("data_inicio_atividade"),
            pl.col("column_12").alias("cnae_fiscal_principal"),
            pl.col("column_14").str.strip_chars().alias("tipo_logradouro"),
            pl.col("column_15").str.strip_chars().alias("logradouro"),
            pl.col("column_16").str.strip_chars().alias("numero"),
            pl.col("column_17").str.strip_chars().alias("complemento"),
            pl.col("column_18").str.strip_chars().alias("bairro"),
            pl.col("column_19").str.replace(r"\D", "").alias("cep"),
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
        BATCH_SIZE = 100000 
        processed_batches = q.collect(streaming=True)
        total_rows = processed_batches.height
        file_record["rows"] = total_rows
        
        if total_rows == 0:
            file_record["status"] = "[white]Vazio[/white]"
            file_record["end"] = datetime.now().strftime("%H:%M:%S")
            return

        file_task = progress.add_task(f"[cyan]{filename}", total=total_rows)
        file_record["status"] = "[blue]Processando...[/blue]"
        if ui_callback: ui_callback()
        
        for i in range(0, total_rows, BATCH_SIZE):
            batch = processed_batches.slice(i, BATCH_SIZE)
            
            # Retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    client.insert(
                        table_name,
                        batch.rows(),
                        column_names=batch.columns
                    )
                    break
                except Exception as e:
                    if attempt < max_retries - 1:
                        time.sleep(5)
                    else:
                        raise e
            
            progress.update(file_task, advance=batch.height)
            if ui_callback: ui_callback()
            
        file_record["status"] = "[green]Sucesso[/green]"
        file_record["end"] = datetime.now().strftime("%H:%M:%S")
        if ui_callback: ui_callback()
        progress.remove_task(file_task)
        progress.update(overall_task, advance=1)
        
    except Exception as e:
        file_record["status"] = f"[red]Erro: {str(e)[:30]}...[/red]"
        file_record["end"] = datetime.now().strftime("%H:%M:%S")
        if ui_callback: ui_callback()

# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------
def main():
    abs_data_dir = os.path.abspath(DATA_DIR)
    if not os.path.exists(abs_data_dir):
        console.print(f"[red]Diretório de dados não encontrado: {abs_data_dir}[/red]")
        return

    client = get_client()
    init_db(client)
    
    priority_order = ['CNAE', 'MUNIC', 'MOTI', 'NATJU', 'SIMPLES', 'EMPRE', 'SOCIO', 'ESTABELE']
    
    all_valid_files = []
    for file_type in priority_order:
        pattern = os.path.join(abs_data_dir, f"*{file_type}*")
        files = glob.glob(pattern)
        valid = sorted([f for f in files if not f.endswith('.zip') and os.path.isfile(f)])
        for f in valid:
            all_valid_files.append((f, file_type))
    
    if not all_valid_files:
        console.print(Panel(
            f"[bold yellow]Nenhum arquivo CSV encontrado![/bold yellow]\n\n"
            f"Diretório: [cyan]{abs_data_dir}[/cyan]\n"
            f"Padrões: [magenta]{priority_order}[/magenta]\n\n"
            f"Verifique se os arquivos foram descompactados corretamente.",
            title="Aviso",
            border_style="yellow"
        ))
        return

    console.log(f"Encontrados {len(all_valid_files)} arquivos para processar.")
    file_summary = []
    
    def generate_table():
        table = Table(title="CNPJ Analytics - ETL Status", expand=True)
        table.add_column("Arquivo", style="cyan", no_wrap=True)
        table.add_column("Tipo", style="magenta")
        table.add_column("Início", style="green")
        table.add_column("Fim", style="green")
        table.add_column("Registros", justify="right", style="bold")
        table.add_column("Status", justify="center")
        
        display_list = file_summary[-15:]
        for f in display_list:
            table.add_row(
                f["file"], 
                f["type"], 
                f["start"], 
                f["end"], 
                f"{f['rows']:,}", 
                f["status"]
            )
        return table

    progress = Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        TextColumn("[progress.percentage]{task.completed}/{task.total}"),
        TimeElapsedColumn(),
        console=console
    )

    layout = Layout()
    layout.split_column(
        Layout(name="header", size=3),
        Layout(name="body"),
        Layout(name="footer", size=10)
    )
    
    layout["header"].update(Panel("[bold white]CNPJ ANALYTICS - ETL PIPELINE[/bold white]", style="blue"))

    try:
        with Live(layout, console=console, refresh_per_second=4) as live:
            overall_task = progress.add_task("[bold green]Progresso Geral", total=len(all_valid_files))
            layout["footer"].update(Panel(progress, title="Processamento Atual"))

        # Organizado em 3 grupos com prioridade (balanceamento dinâmico)
            # Priority: 1 = alta (dimensões), 2 = média (dados empresas), 3 = baixa (estabelecimentos grandes)
            work_queue = queue.PriorityQueue()
            
            for f_path, f_type in all_valid_files:
                if f_type in ['CNAE', 'MUNIC', 'MOTI', 'NATJU']:
                    priority = 1  # Processar primeiro (pequenos, necessários para JOINs)
                elif f_type in ['SIMPLES', 'EMPRE', 'SOCIO']:
                    priority = 2  # Processar em seguida
                else:  # ESTABELE
                    priority = 3  # Processar por último (mais pesados)
                work_queue.put((priority, f_path, f_type))

            # Função de callback para atualizar UI
            def refresh_ui():
                layout["body"].update(generate_table())

            # Função do Worker com balanceamento dinâmico
            def worker_process():
                # Cada thread precisa de sua própria conexão
                local_client = get_client()
                try:
                    while True:
                        try:
                            # Timeout de 1 segundo para evitar bloqueio infinito
                            priority, fp, ft = work_queue.get(timeout=1)
                            refresh_ui()
                            process_file(fp, ft, local_client, progress, overall_task, file_summary, ui_callback=refresh_ui)
                            refresh_ui()
                            work_queue.task_done()
                        except queue.Empty:
                            # Fila vazia, worker pode terminar
                            break
                finally:
                    pass

            # Executa com ThreadPoolExecutor (3 workers balanceados)
            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = [executor.submit(worker_process) for _ in range(3)]
                
                # Aguarda conclusão e trata exceções
                for future in concurrent.futures.as_completed(futures):
                    try:
                        future.result()
                    except Exception as exc:
                        console.print(f"[bold red]Exceção em worker: {exc}[/bold red]")

        console.print(f"\n[bold green]Concluído com sucesso. {len(all_valid_files)} arquivos processados.[/bold green]")
    except Exception as e:
        console.print(f"\n[bold red]ERRO FATAL NO LOOP PRINCIPAL: {e}[/bold red]")
        import traceback
        console.print(traceback.format_exc())

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[yellow]Interrompido pelo usuário.[/yellow]")
    except Exception as e:
        console.print(f"\n[bold red]ERRO CRÍTICO: {e}[/bold red]")
        import traceback
        console.print(traceback.format_exc())
    finally:
        console.print("\n" + "-"*40)
        input("Pressione Enter para sair...")