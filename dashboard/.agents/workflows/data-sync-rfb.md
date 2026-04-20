---
description: Workflow para download e carga anual/mensal dos dados da Receita Federal
---

# Sincronização com a Receita Federal (RFB)

Este fluxo cobre desde o download bruto até a carga final no ClickHouse.

## Passo 1: Download via Go
Execute o binário de download em Go para garantir máxima velocidade e paralelismo.
```bash
./downloader --output ./data/raw --concurrency 10
```

## Passo 2: Limpeza e Preparação
- Descompacte os arquivos `.zip` para `.csv`.
- Remova arquivos temporários após a extração para economizar espaço em disco.

## Passo 3: Carga via Python (populate.py)
A carga deve ser feita utilizando o script `populate.py`, que gerencia os batches para o ClickHouse.
```bash
python etl/populate.py --source ./data/csv --db analytics
```

## Passo 4: Verificação de Integridade
Sempre execute uma query de contagem para validar se o volume carregado é coerente com a partição anterior.
```sql
SELECT partition, count() 
FROM empresas 
GROUP BY partition 
ORDER BY partition DESC;
```
