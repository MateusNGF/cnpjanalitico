# Catálogo de Queries "Golden" - ClickHouse

Regras e templates para garantir performance em tabelas com milhões de registros.

## 1. AggregatingMergeTree (Estado vs Fusão)
Sempre que consultar tabelas de pré-agregação, utilize o sufixo `-State` para persistir e `-Merge` para ler.
- **Errado:** `count(empresa_id)` em tabelas agregadas.
- **Certo:** `countMerge(contagem_empresas_state)`
- **Exemplo de Consulta:**
  ```sql
  SELECT 
      cnae_id,
      countMerge(total_empresas_state) as total
  FROM analytics.daily_stats_mv
  GROUP BY cnae_id
  ```

## 2. Anti-JOIN Pattern (Otimização de Memória)
JOINs são custosos em ClickHouse. Use **Dictionaries** ou **Subqueries** com operadores `IN`.
- **Errado:** `SELECT ... FROM empresas JOIN cidades ON ...`
- **Certo:** `SELECT ..., dictGet('cidades_dict', 'nome', cidade_id) as cidade_nome FROM empresas`
- **Certo (Subquery):**
  ```sql
  SELECT * FROM empresas 
  WHERE cidade_id IN (SELECT id FROM cidades WHERE uf = 'SP')
  ```

## 3. Agregação Geo-Espacial (Mapas Leaflet)
Para mapas de calor ou clusters, utilize Geohash para agrupar pontos próximos rapidamente.
- **Template:**
  ```sql
  SELECT 
      geohashEncode(longitude, latitude, 5) as hash, -- Nível 5 para clusters médios
      count(*) as densidade
  FROM empresas
  WHERE cod_situacao = 2 -- ATIVA
  GROUP BY hash
  ```
- **Nota:** O frontend deve usar `geohashDecode` ou converter o hash para polígonos no Leaflet.

## 4. Exploração Rápida (Sampling)
Para exploração inicial ou estatísticas aproximadas, sempre use `SAMPLE`.
- **Query:**
  ```sql
  SELECT 
      natureza_juridica, 
      count() * 10 as estimativa_total -- Multiplique pelo inverso do sample (0.1 -> 10)
  FROM empresas
  SAMPLE 0.1 -- Processa apenas 10% dos dados
  WHERE cod_situacao = 2 -- ATIVA
  GROUP BY natureza_juridica
  ```

## 5. Filtros de Baixa Cardinalidade
Utilize colunas do tipo `Enum` ou `LowCardinality` para acelerar filtros de `UF`, `Situacao` ou `Porte`.
