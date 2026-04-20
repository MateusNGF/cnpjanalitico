# 🔩 Spec: ClickHouse Schema & Medallion Logic

Esta especificação define as regras para qualquer alteração na base de dados ClickHouse.

## 1. Regras de Nomenclatura
- **Tabelas Silver:** `cnpj_silver.<nome_entidade>` (ex: `estabelecimentos`)
- **Tabelas Gold:** `cnpj_gold.mv_<nome_entidade>_<agregacao>` (ex: `mv_leads_por_uf`)
- **Views de Consumo:** `cnpj_gold.v_<nome>` (ex: `v_leads`)

## 2. Padrões de Tipagem (Silver)
- **Strings de Alta Cardinalidade:** Usar `CODEC(ZSTD(3))`.
- **Strings de Baixa Cardinalidade:** Usar `LowCardinality(String)`.
- **Datas:** Nunca usar `Nullable(Date)`. Usar `Date32` com valor default `1900-01-01`.
- **Pontos Geográficos:** Usar o tipo `Point`.

## 3. Padrões de Performance
- **Particionamento:** Tabela `estabelecimentos` deve ser SEMPRE particionada por `uf`.
- **Sorting Key:** O primeiro item da `ORDER BY` deve ser a coluna mais filtrada (ex: `uf`, `cnae_fiscal_principal`).
- **Projections:** Devem ser usadas para agregações frequentes que não cabem em MVs.

## 4. Camada Gold (Materialized Views)
- Devem usar preferencialmente o motor `SummingMergeTree`.
- Campos de métrica (contagens, somas) devem ser `UInt64` ou `Float64`.
- **Regra de Ouro:** Uma MV na Gold nunca deve realizar `JOIN` no momento do `INSERT`. Joins complexos devem ser feitos em `VIEW` simples de consumo.
