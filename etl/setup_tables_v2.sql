-- setup_tables_v2.sql
-- Script de Inicialização da Estrutura (Tabelas e MVs independentes)
-- Otimizado para Memória (Sem Nullable + Codecs)
-- NÃO CONTÉM: Dicionários (criados via ETL) e Views dependentes

CREATE DATABASE IF NOT EXISTS cnpj_analytics;

-- --------------------------------------------------------
-- 1. Tabelas de Dimensão
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS cnpj_analytics.dim_estados (
    codigo_uf UInt8,
    nome String,
    sigla FixedString(2),
    flag_url String,
    regiao String,
    coordenadas Point
) ENGINE = MergeTree()
ORDER BY codigo_uf;

CREATE TABLE IF NOT EXISTS cnpj_analytics.dim_municipios (
    codigo FixedString(4), 
    descricao String,
    codigo_ibge FixedString(7),
    uf FixedString(2),
    coordenadas Point
) ENGINE = MergeTree() 
ORDER BY codigo;

CREATE TABLE IF NOT EXISTS cnpj_analytics.dim_cnae (
    codigo String,
    descricao String,
    INDEX idx_cnae_desc descricao TYPE tokenbf_v1(1024, 3, 0) GRANULARITY 4,
    INDEX idx_cnae_ngram descricao TYPE ngrambf_v1(4, 1024, 3, 0) GRANULARITY 1
) ENGINE = MergeTree() ORDER BY codigo;

CREATE TABLE IF NOT EXISTS cnpj_analytics.dim_motivos (
    codigo String,
    descricao String
) ENGINE = MergeTree() ORDER BY codigo;

CREATE TABLE IF NOT EXISTS cnpj_analytics.dim_naturezas_juridicas (
    codigo String,
    descricao String
) ENGINE = MergeTree() ORDER BY codigo;

-- --------------------------------------------------------
-- 2. Tabelas Cadastrais (Otimizadas)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS cnpj_analytics.simples (
    cnpj_basico FixedString(8),
    opcao_pelo_simples LowCardinality(String),
    data_opcao_simples Date32 DEFAULT toDate32('1900-01-01') CODEC(Delta, ZSTD(1)),
    data_exclusao_simples Date32 DEFAULT toDate32('1900-01-01') CODEC(Delta, ZSTD(1)),
    opcao_pelo_mei LowCardinality(String),
    data_opcao_mei Date32 DEFAULT toDate32('1900-01-01') CODEC(Delta, ZSTD(1)),
    data_exclusao_mei Date32 DEFAULT toDate32('1900-01-01') CODEC(Delta, ZSTD(1))
) ENGINE = MergeTree() 
ORDER BY cnpj_basico;

CREATE TABLE IF NOT EXISTS cnpj_analytics.empresas (
    cnpj_basico FixedString(8),
    razao_social String CODEC(ZSTD(1)),
    natureza_juridica LowCardinality(String),
    capital_social Float64 DEFAULT 0 CODEC(Gorilla, ZSTD(1)),
    porte_empresa LowCardinality(String)
) ENGINE = MergeTree() 
ORDER BY cnpj_basico;

CREATE TABLE IF NOT EXISTS cnpj_analytics.socios (
    cnpj_basico FixedString(8),
    identificador_socio LowCardinality(String),
    nome_socio String CODEC(ZSTD(1)),
    cnpj_cpf_socio String,
    qualificacao_socio LowCardinality(String),
    data_entrada_sociedade Date32 DEFAULT toDate32('1900-01-01') CODEC(Delta, ZSTD(1)),
    pais LowCardinality(String),
    faixa_etaria LowCardinality(String)
) ENGINE = MergeTree() 
ORDER BY (cnpj_basico, nome_socio);

-- --------------------------------------------------------
-- 3. Tabela Principal (Estabelecimentos)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS cnpj_analytics.estabelecimentos (
    cnpj_basico FixedString(8),
    cnpj_ordem FixedString(4),
    cnpj_dv FixedString(2),
    identificador_matriz_filial LowCardinality(String),
    nome_fantasia String DEFAULT '' CODEC(ZSTD(1)), 
    situacao_cadastral LowCardinality(String),
    data_situacao_cadastral Date32 DEFAULT toDate32('1900-01-01') CODEC(Delta, ZSTD(1)),
    cnae_fiscal_principal LowCardinality(String),
    tipo_logradouro LowCardinality(String) DEFAULT '',
    logradouro String DEFAULT '',
    numero String DEFAULT '',
    complemento String DEFAULT '',
    bairro String DEFAULT '',
    cep FixedString(8),
    uf LowCardinality(FixedString(2)),
    municipio LowCardinality(String),
    data_inicio_atividade Date32 DEFAULT toDate32('1900-01-01') CODEC(Delta, ZSTD(1)),
    ddd1 String DEFAULT '',
    telefone1 String DEFAULT '',
    correio_eletronico String DEFAULT '' CODEC(ZSTD(1)),
    INDEX idx_fantasia nome_fantasia TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 4,
    INDEX idx_bairro bairro TYPE bloom_filter(0.01) GRANULARITY 1
) ENGINE = MergeTree() 
PARTITION BY uf
ORDER BY (uf, cnae_fiscal_principal, situacao_cadastral, municipio, cnpj_basico);

-- --------------------------------------------------------
-- 4. Materialized Views (Analytics)
-- --------------------------------------------------------

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_resumo_uf 
ENGINE = SummingMergeTree() 
ORDER BY (uf, situacao_cadastral) AS
SELECT uf, situacao_cadastral, count() as total
FROM cnpj_analytics.estabelecimentos
GROUP BY uf, situacao_cadastral;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_cnae_ranking
ENGINE = SummingMergeTree()
ORDER BY (uf, cnae_fiscal_principal) AS
SELECT uf, cnae_fiscal_principal, count() as total
FROM cnpj_analytics.estabelecimentos
GROUP BY uf, cnae_fiscal_principal;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_cnae_municipio_ranking
ENGINE = SummingMergeTree()
ORDER BY (uf, municipio, cnae_fiscal_principal) AS
SELECT uf, municipio, cnae_fiscal_principal, count() as total
FROM cnpj_analytics.estabelecimentos
GROUP BY uf, municipio, cnae_fiscal_principal;

-- REMOVIDA: MV com JOIN causa OOM durante INSERT de estabelecimentos
-- A segmentação por porte será feita como VIEW em setup_views_v2.sql
-- CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_segmentacao_porte
-- ENGINE = SummingMergeTree()
-- ORDER BY (uf, municipio, porte) AS
-- SELECT 
--     uf,
--     municipio,
--     CASE 
--         WHEN s.opcao_pelo_mei = 'S' THEN 'MEI'
--         WHEN emp.porte_empresa = '01' THEN 'GRANDE'
--         WHEN emp.porte_empresa IN ('03', '05') THEN 'PEQUENA'
--         ELSE 'OUTROS'
--     END as porte,
--     count() as total
-- FROM cnpj_analytics.estabelecimentos e
-- LEFT JOIN cnpj_analytics.empresas emp ON e.cnpj_basico = emp.cnpj_basico
-- LEFT JOIN cnpj_analytics.simples s ON e.cnpj_basico = s.cnpj_basico
-- WHERE e.situacao_cadastral = '02'
-- GROUP BY uf, municipio, porte;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_balanco_mercado
ENGINE = SummingMergeTree()
ORDER BY (uf, ano_mes) AS
SELECT 
    uf,
    toStartOfMonth(
        if(data_inicio_atividade = toDate32('1900-01-01'), 
           data_situacao_cadastral, 
           data_inicio_atividade)
    ) as ano_mes,
    countIf(situacao_cadastral = '02') as natalidade,
    countIf(situacao_cadastral = '08') as mortalidade
FROM cnpj_analytics.estabelecimentos
WHERE data_inicio_atividade != toDate32('1900-01-01') 
   OR data_situacao_cadastral != toDate32('1900-01-01')
GROUP BY uf, ano_mes;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_natalidade_mensal
ENGINE = SummingMergeTree()
ORDER BY (uf, ano_mes) AS
SELECT 
    uf,
    toStartOfMonth(data_inicio_atividade) as ano_mes, 
    count() as novos_cnpjs
FROM cnpj_analytics.estabelecimentos
WHERE data_inicio_atividade != toDate32('1900-01-01')
GROUP BY uf, ano_mes;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_resumo_municipio 
ENGINE = SummingMergeTree() 
ORDER BY (uf, municipio) AS
SELECT uf, municipio, count() as total
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '02'
GROUP BY uf, municipio;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_ranking_bairros
ENGINE = SummingMergeTree()
ORDER BY (uf, municipio, bairro, cnae_fiscal_principal) AS
SELECT uf, municipio, bairro, cnae_fiscal_principal, count() as total
FROM cnpj_analytics.estabelecimentos
WHERE bairro != ''
GROUP BY uf, municipio, bairro, cnae_fiscal_principal;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_densidade_logradouro
ENGINE = SummingMergeTree()
ORDER BY (uf, municipio, logradouro) AS
SELECT uf, municipio, logradouro, count() as total
FROM cnpj_analytics.estabelecimentos
WHERE logradouro != ''
GROUP BY uf, municipio, logradouro;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_mortalidade_mensal
ENGINE = SummingMergeTree()
ORDER BY (ano_mes, uf) AS
SELECT 
    toStartOfMonth(data_situacao_cadastral) as ano_mes,
    uf,
    count() as empresas_baixadas
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '08'
  AND data_situacao_cadastral != toDate32('1900-01-01')
GROUP BY ano_mes, uf;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_top_socios
ENGINE = SummingMergeTree()
ORDER BY (nome_socio_hash) AS
SELECT 
    sipHash64(nome_socio) as nome_socio_hash,
    any(nome_socio) as nome_exibicao,
    count() as qtd_empresas,
    uniqCombined(cnpj_basico) as qtd_cnpjs_unicos
FROM cnpj_analytics.socios
WHERE nome_socio != ''
GROUP BY nome_socio_hash;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_faixa_idade_empresas
ENGINE = SummingMergeTree()
ORDER BY (uf, faixa_idade) AS
SELECT
    uf,
    CASE
        WHEN dateDiff('year', data_inicio_atividade, now()) < 1 THEN '0-1 Ano'
        WHEN dateDiff('year', data_inicio_atividade, now()) < 3 THEN '1-3 Anos'
        WHEN dateDiff('year', data_inicio_atividade, now()) < 5 THEN '3-5 Anos'
        ELSE '5+ Anos'
    END as faixa_idade,
    count() as total
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '02'
  AND data_inicio_atividade != toDate32('1900-01-01')
GROUP BY uf, faixa_idade;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_stats_sobrevivencia
ENGINE = SummingMergeTree()
ORDER BY (uf, cnae_fiscal_principal, tempo_vida_anos) AS
SELECT 
    uf,
    cnae_fiscal_principal,
    dateDiff('year', data_inicio_atividade, data_situacao_cadastral) as tempo_vida_anos,
    count() as total_empresas
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '08'
  AND data_inicio_atividade != toDate32('1900-01-01')
  AND data_situacao_cadastral != toDate32('1900-01-01')
GROUP BY uf, cnae_fiscal_principal, tempo_vida_anos;

CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_densidade_geografica
ENGINE = SummingMergeTree()
ORDER BY (uf, municipio, cep_prefixo, cnae_fiscal_principal) AS
SELECT 
    uf,
    municipio,
    substring(cep, 1, 5) as cep_prefixo,
    cnae_fiscal_principal,
    count() as total
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '02'
GROUP BY uf, municipio, cep_prefixo, cnae_fiscal_principal;

-- --------------------------------------------------------
-- 5. Índices Secundários Adicionais (Otimização de Memória)
-- --------------------------------------------------------
-- minmax: Ideal para filtros de range em datas e valores numéricos
-- set(N): Eficiente para colunas com poucos valores distintos

-- Índices na tabela estabelecimentos (executados via ALTER pois podem já existir)
-- ALTER TABLE cnpj_analytics.estabelecimentos 
-- ADD INDEX IF NOT EXISTS idx_data_inicio data_inicio_atividade TYPE minmax GRANULARITY 1;

-- ALTER TABLE cnpj_analytics.estabelecimentos 
-- ADD INDEX IF NOT EXISTS idx_situacao situacao_cadastral TYPE set(10) GRANULARITY 1;

-- ALTER TABLE cnpj_analytics.empresas 
-- ADD INDEX IF NOT EXISTS idx_capital capital_social TYPE minmax GRANULARITY 1;

-- --------------------------------------------------------
-- 6. MVs com AggregatingMergeTree (DESABILITADAS - causam OOM)
-- --------------------------------------------------------
-- AVISO: Estas MVs fazem JOINs durante INSERT e causam OOM com 36GB de RAM.
-- Usar como VIEWs normais em setup_views_v2.sql após carga completa.

-- REMOVIDA: mv_capital_analytics (JOIN com empresas durante INSERT)
-- CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_capital_analytics
-- ENGINE = AggregatingMergeTree()
-- ORDER BY (uf, natureza_juridica) AS
-- SELECT 
--     e.uf,
--     emp.natureza_juridica,
--     count() as total_empresas,
--     sumState(emp.capital_social) as capital_total_state,
--     avgState(emp.capital_social) as capital_medio_state,
--     quantileTDigestState(0.5)(emp.capital_social) as mediana_capital_state,
--     quantileTDigestState(0.95)(emp.capital_social) as p95_capital_state
-- FROM cnpj_analytics.estabelecimentos e
-- JOIN cnpj_analytics.empresas emp ON e.cnpj_basico = emp.cnpj_basico
-- WHERE e.situacao_cadastral = '02'
-- GROUP BY e.uf, emp.natureza_juridica;

-- REMOVIDA: mv_socios_analytics (JOIN com estabelecimentos durante INSERT)
-- CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_socios_analytics
-- ENGINE = AggregatingMergeTree()
-- ORDER BY (uf, qualificacao_socio) AS
-- SELECT 
--     e.uf,
--     s.qualificacao_socio,
--     uniqCombinedState(s.nome_socio) as socios_unicos_state,
--     uniqCombinedState(s.cnpj_basico) as empresas_com_socio_state,
--     countState() as total_vinculos_state
-- FROM cnpj_analytics.socios s
-- JOIN cnpj_analytics.estabelecimentos e ON s.cnpj_basico = e.cnpj_basico
-- GROUP BY e.uf, s.qualificacao_socio;

-- Views dependentes de dicionários foram movidas para 'setup_views_v2.sql'

