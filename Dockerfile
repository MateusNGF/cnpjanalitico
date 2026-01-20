# Estágio 1: Build do Downloader em Go
FROM golang:1.21-bullseye AS builder
WORKDIR /build
COPY downloader/go.mod downloader/go.sum ./
RUN go mod download
COPY downloader/main.go .
RUN go build -o downloader main.go

# Estágio 2: Ambiente de Execução Python + Binário Go
FROM python:3.10-slim-bullseye
WORKDIR /app

# Instala dependências do SO
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Copia binário do Go
COPY --from=builder /build/downloader /app/downloader/downloader

# Copia e instala dependências Python
COPY etl/requirements.txt ./etl/
RUN pip install --no-cache-dir -r etl/requirements.txt

# Copia código fonte Python
COPY etl/etl.py /app/etl/

# Cria diretórios
RUN mkdir -p /app/dados_temp

CMD ["/app/downloader/downloader"]