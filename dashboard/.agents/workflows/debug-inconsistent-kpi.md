---
description: Guia para quando um valor no dashboard parece errado ou improvável
---

# Fluxo: Depuração de KPI Inconsistente

Siga este passo-a-passo caso um valor (ex: Total de Empresas) pareça fora da realidade.

## Passo 1: Comparação Origem vs Destino
Execute a query SQL do serviço diretamente no console do ClickHouse.
- **Se o valor bater com o Dashboard:** O problema está na query ou no dado bruto (ETL).
- **Se o valor for diferente:** Verifique se o frontend está aplicando filtros extras ou se há erro de lógica no mapeamento do JSON.

## Passo 2: Verificação de Filtros "Escondidos"
Verifique no código se o filtro de `cod_situacao = 2` (Ativa) está sendo aplicado.
- **Dica:** É comum o valor estar maior que o esperado porque empresas "Baixadas" estão sendo contadas indevidamente.

## Passo 3: Frescor dos Dados (ETL)
Verifique a última data de carga na tabela:
```sql
SELECT max(processed_at) FROM empresas;
```
Se a data for muito antiga, o pipeline ETL pode ter falhado silenciosamente.

## Passo 4: Verificação de Nulos
Verifique se campos numéricos (ex: `capital_social`) possuem valores nulos que estão puxando a média para baixo ou causando `NaN`.
