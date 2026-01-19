import requests
import os
import zipfile
from bs4 import BeautifulSoup
from tqdm import tqdm
import re

# URL oficial dos Dados Abertos - ATUALIZADO para a pasta mensal mais recente
BASE_URL = "https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/2026-01/"
# Diretório onde salvaremos os zips e extraídos
OUTPUT_DIR = "/app/dados_temp"

def get_files_from_url(url):
    """Varre a página HTML para encontrar todos os arquivos .zip"""
    print(f"Buscando arquivos em: {url}")
    try:
        response = requests.get(url, verify=False, timeout=30) # verify=False pois o cert da Receita as vezes falha
        soup = BeautifulSoup(response.text, 'html.parser')
        
        files = []
        for link in soup.find_all('a'):
            href = link.get('href')
            if href and href.lower().endswith('.zip'):
                files.append(href)
        
        # Filtra apenas os arquivos essenciais para sua consultoria
        # (Ignora arquivos antigos ou de backup se houver)
        target_files = [
            f for f in files if any(x in f.upper() for x in [
                'ESTABELE', 'EMPRE', 'SOCIO', 'CNAE', 'MUNIC', 'MOTI', 'NATJU', 'SIMPLES'
            ])
        ]
        return sorted(list(set(target_files)))
    except Exception as e:
        print(f"Erro ao acessar a URL: {e}")
        return []

def download_file(url, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    # Se já existe e tem tamanho > 0, pula (resume simples)
    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        print(f"Arquivo {filename} já existe. Pulando download.")
        return filepath

    print(f"Baixando {filename}...")
    response = requests.get(url, stream=True, verify=False)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(filepath, 'wb') as f, tqdm(
        desc=filename,
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as bar:
        for data in response.iter_content(chunk_size=1024):
            size = f.write(data)
            bar.update(size)
    return filepath

def extract_file(filepath):
    """Extrai o arquivo .zip e remove o zip original para economizar espaço"""
    try:
        print(f"Extraindo {filepath}...")
        with zipfile.ZipFile(filepath, 'r') as zip_ref:
            zip_ref.extractall(OUTPUT_DIR)
        
        # Opcional: Remover o zip após extrair para economizar disco
        # os.remove(filepath) 
        print(f"Extração concluída: {filepath}")
    except zipfile.BadZipFile:
        print(f"Erro: O arquivo {filepath} está corrompido.")

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    files = get_files_from_url(BASE_URL)
    
    if not files:
        print("Nenhum arquivo encontrado. Verifique a URL base.")
        return

    print(f"Encontrados {len(files)} arquivos para processar.")
    
    for filename in files:
        file_url = f"{BASE_URL.rstrip('/')}/{filename}"
        
        # 1. Download
        local_path = download_file(file_url, filename)
        
        # 2. Extração
        extract_file(local_path)

if __name__ == "__main__":
    # Desabilita warnings de SSL inseguro (comum no site do governo)
    requests.packages.urllib3.disable_warnings()
    main()