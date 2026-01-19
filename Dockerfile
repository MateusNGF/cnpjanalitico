FROM python:3.10-slim

WORKDIR /app

# Instala dependências do SO necessárias
RUN apt-get update && apt-get install -y wget unzip && rm -rf /var/lib/apt/lists/*

# Copia e instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Cria diretórios
RUN mkdir -p /app/src /app/dados_temp

CMD ["python", "src/etl.py"]