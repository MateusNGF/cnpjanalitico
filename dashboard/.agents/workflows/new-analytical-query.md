---
description: Fluxo para criar uma nova métrica no dashboard, da query à API
---

# Fluxo: Nova Métrica Analítica

Siga este processo para garantir que novas métricas sejam performáticas desde a concepção.

## Passo 1: Definição da Lógica
Defina a regra de negócio (ex: natalidade de empresas = aberturas no período / total existente).

## Passo 2: Criação da Query "Golden"
Utilize os templates da pasta `queries/templates.md`. Priorize o uso de tabelas `AggregatingMergeTree`.
- **Exemplo:** Se for contagem de empresas por setor, use `countMerge(total_state)`.

## Passo 3: Teste de Latência
Execute a query diretamente no ClickHouse acompanhando o tempo de execução.
- **Goal:** Meta de < 500ms para queries de dashboard.
- **Fail:** Se > 1s, revise a query usando o `query-optimization-flow.md`.

## Passo 4: Implementação da Rota API
Crie a rota em `src/app/api/...`.
- Integre a query ClickHouse.
- Adicione validação Zod no retorno dos dados.
- Garanta que a rota responda no formato JSON compatível com os `response-templates.md`.
