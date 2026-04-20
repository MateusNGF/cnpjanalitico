---
description: Como aplicar uma atualização de infraestrutura no ClickHouse
---

Para atualizar a estrutura de dados (Medallion) ou aplicar novas Projections:

1. **Validação de Backup:** Certifique-se de que o `manifest.json` do downloader está atualizado.
2. **Setup de Bancos:** Execute o script de criação de databases:
   ```bash
   clickhouse-client --queries-file etl/medallion_setup.sql
   ```
3. **Migração de Tabelas:** Aplique o schema Silver:
   ```bash
   clickhouse-client --queries-file etl/setup_tables_v2.sql
   ```
4. **Atualização de Views:** Atualize a camada Gold:
   ```bash
   clickhouse-client --queries-file etl/setup_views_v2.sql
   ```
5. **Teste de Integridade:** Verifique o endpoint de saúde:
   ```bash
   curl http://localhost:3000/api/health
   ```
