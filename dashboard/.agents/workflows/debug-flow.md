---
description: Guia para diagnósticos de falhas no ETL, Banco de Dados e Frontend
---

# Estratégia de Troubleshooting (Debug Flow)

Siga este guia sistemático ao encontrar erros ou comportamentos inesperados.

## 1. Falha no Carregamento de Dados (ETL/Data)
Se o dashboard exibir dados desatualizados ou vazios:
- **Passo 1:** Verifique a tabela `system.parts` no ClickHouse para confirmar se a última partição foi carregada.
  ```sql
  SELECT table, partition, max_modification_time 
  FROM system.parts 
  WHERE table = 'empresas' 
  ORDER BY max_modification_time DESC LIMIT 1;
  ```
- **Passo 2:** Verifique os logs do Python ETL (`/etl/logs/`) em busca de erros de conexão com a RFB ou timeout no ClickHouse.

## 2. Lentidão em Consultas (Query Timeout)
Se o gráfico ou mapa demorar mais de 1s para carregar:
- **Passo 1:** Verifique se o filtro de `uf` está utilizando o **índice primário** da tabela (ORDER BY no DDL).
- **Passo 2:** Utilize `EXPLAIN` na query para ver se há leitura de colunas desnecessárias.
- **Passo 3:** Considere mover a query para uma `AggregatingMergeTree` se o volume for exploratório.

## 3. Inconsistência de Filtros (Context/UI)
Se as cidades ou resultados não aparecerem ao filtrar:
- **Passo 1:** Verifique se o `municipio_id` está sendo passado corretamente via `URLSearchParams` no `use-data-store.ts` (Zustand) ou no `filters$` (RxJS).
- **Passo 2:** Valide se o `municipio_id` segue o padrão TOM (Receita) ou se houve confusão com códigos IBGE.
- **Passo 3:** Verifique o log do navegador para ver se o serviço RxJS capturou um erro de validação do Zod (Schema mismatch).

## 4. Problemas de Renderização (Tailwind/v4)
Se o componente Shadcn parecer "quebrado":
- **Passo 1:** Confirme se as variáveis de tema no arquivo de CSS principal estão carregando (Tailwind v4 exige importação direta via `@theme`).
- **Passo 2:** Verifique se o componente foi instalado corretamente em `src/components/ui/`.
