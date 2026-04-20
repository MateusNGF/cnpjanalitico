---
description: Guia para identificar e resolver gargalos de performance no ClickHouse
---

# Fluxo: Otimização de Gargalos (Query Tuning)

Use este fluxo quando o dashboard apresentar lentidão em componentes específicos.

## Passo 1: Identificação
Consulte o log de queries do ClickHouse para identificar o "vilão".
```sql
SELECT query, query_duration_ms, read_rows, read_bytes 
FROM system.query_log 
WHERE type = 'QueryFinish' 
ORDER BY query_duration_ms DESC LIMIT 5;
```

## Passo 2: Eliminação de JOINs
Verifique se a query lenta usa JOINs relacionais.
- **Ação:** Substitua por `dictGet` se estiver buscando nomes de Cidades/CNAEs.
- **Ação:** Transforme JOINs de filtragem em subqueries `IN (SELECT ...)`.

## Passo 3: Verificação de Índices
Verifique o `DDL` da tabela original.
- O filtro principal (`UF`, `CNAE`, `Data`) faz parte do `ORDER BY` ou `PRIMARY KEY`?
- Se não, a query está fazendo um **Full Table Scan**, o que é proibido para o Dashboard.

## Passo 4: Pré-Agregação (Materialized Views)
Se a query sobre dados brutos for inevitavelmente lenta, crie uma `Materialized View` com `AggregatingMergeTree` para pré-calcular os resultados.
