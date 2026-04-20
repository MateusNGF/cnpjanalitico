# 🔄 Spec: Ciclo de Vida do Dado

Esta especificação define o fluxo do dado desde a origem (Receita Federal) até o consumo visual.

## 1. Aquisição (Bronze)
- **Origem:** HTTP GET (Receita Federal).
- **Validação:** Checksum/Size via `HEAD`.
- **Atomicidade:** ZIP -> Temp ZIP -> Extrated CSV -> Delete ZIP.
- **Ingress:** `cnpj_bronze.raw_*`.

## 2. Refinamento (Silver)
- **Engine:** Python Polars.
- **Fluxo:**
    1. Scan CSV (Lazy).
    2. Column rename.
    3. Strict Typing (Date parsing, float cleaning).
    4. Fill Nulls with sentinel values.
    5. Batch Insert into `cnpj_silver`.

## 3. Ativação (Gold)
- **Mecanismo:** Materialized Views automáticas no ClickHouse.
- **Trigger:** Ao inserir na Silver, as MVs Gold são atualizadas instantaneamente.
- **Output:** Agregados por UF, Município e Setor.

## 4. Expansão (Export)
- **Fluxo:** Query SQL -> CSV on disk -> Link temporário gerado para o cliente.
- **Residência:** Arquivos exportados em `public/exports` devem ser limpos a cada 24h (Job pendente).
