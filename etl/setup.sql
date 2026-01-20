-- setup_optimized.sql
-- Script de Inicialização Otimizado para ClickHouse (CNPJ Analítico)

CREATE DATABASE IF NOT EXISTS cnpj_analytics;

-- --------------------------------------------------------
-- 1. Tabelas de Dimensão
-- Alterado para MergeTree para permitir consultas flexíveis e persistência em disco
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS cnpj_analytics.dim_municipios (
    codigo FixedString(4), -- Código IBGE sem dígito verificador usualmente
    descricao String,
    codigo_ibge FixedString(7),  -- Novo: Código IBGE (Para Mapas)
    uf FixedString(2),           -- Novo: Estado (Facilita filtros)
    latitude Float64,            -- Novo: Opcional (se disponível)
    longitude Float64            -- Novo: Opcional (se disponível)
) ENGINE = MergeTree() ORDER BY codigo;

CREATE TABLE IF NOT EXISTS cnpj_analytics.dim_cnae (
    codigo String, -- Pode conter caracteres especiais ou ser numérico
    descricao String
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
-- 2. Tabelas de Dados Cadastrais
-- --------------------------------------------------------

-- Tabela Simples Nacional
CREATE TABLE IF NOT EXISTS cnpj_analytics.simples (
    cnpj_basico FixedString(8),
    opcao_pelo_simples LowCardinality(String),
    data_opcao_simples Nullable(Date32),
    data_exclusao_simples Nullable(Date32),
    opcao_pelo_mei LowCardinality(String),
    data_opcao_mei Nullable(Date32),
    data_exclusao_mei Nullable(Date32)
) ENGINE = MergeTree() 
ORDER BY cnpj_basico;

-- Tabela de Empresas (Dados agregados da raiz do CNPJ)
CREATE TABLE IF NOT EXISTS cnpj_analytics.empresas (
    cnpj_basico FixedString(8),
    razao_social String CODEC(ZSTD(1)),
    natureza_juridica LowCardinality(String),
    capital_social Float64,
    porte_empresa LowCardinality(String)
) ENGINE = MergeTree() 
ORDER BY cnpj_basico;

-- Tabela de Sócios
CREATE TABLE IF NOT EXISTS cnpj_analytics.socios (
    cnpj_basico FixedString(8),
    identificador_socio LowCardinality(String),
    nome_socio String CODEC(ZSTD(1)),
    cnpj_cpf_socio String,
    qualificacao_socio LowCardinality(String),
    data_entrada_sociedade Nullable(Date32),
    pais LowCardinality(String),
    faixa_etaria LowCardinality(String)
) ENGINE = MergeTree() 
ORDER BY (cnpj_basico, nome_socio);

-- --------------------------------------------------------
-- 3. Tabela Principal (Estabelecimentos)
-- Otimizada para consultas por Região e Atividade
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS cnpj_analytics.estabelecimentos (
    cnpj_basico FixedString(8),
    cnpj_ordem FixedString(4),
    cnpj_dv FixedString(2),
    identificador_matriz_filial LowCardinality(String),
    nome_fantasia String CODEC(ZSTD(1)), 
    situacao_cadastral LowCardinality(String),
    data_situacao_cadastral Nullable(Date32),
    cnae_fiscal_principal LowCardinality(String),
    tipo_logradouro LowCardinality(String),
    logradouro String,
    numero String,
    complemento String,
    bairro String,
    cep FixedString(8),
    uf LowCardinality(FixedString(2)),
    municipio LowCardinality(String),
    data_inicio_atividade Nullable(Date32),
    ddd1 String,
    telefone1 String,
    correio_eletronico String CODEC(ZSTD(1))
) ENGINE = MergeTree() 
PARTITION BY uf
-- A ordem abaixo otimiza queries do tipo: "Quantas empresas ativas de TI existem em MG?"
ORDER BY (uf, cnae_fiscal_principal, situacao_cadastral, municipio, cnpj_basico);

-- --------------------------------------------------------
-- 4. Materialized Views (Analytics em Tempo Real)
-- Utilizando SummingMergeTree para pré-computar totais
-- --------------------------------------------------------

-- MV: Resumo por UF e Situação
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_resumo_uf 
ENGINE = SummingMergeTree() 
ORDER BY (uf, situacao_cadastral) AS
SELECT 
    uf, 
    situacao_cadastral, 
    count() as total -- Usa count() simples que será somado
FROM cnpj_analytics.estabelecimentos
GROUP BY uf, situacao_cadastral;

-- MV: Ranking de CNAE (Atividades Econômicas) por UF
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_cnae_ranking
ENGINE = SummingMergeTree()
ORDER BY (uf, cnae_fiscal_principal) AS
SELECT 
    uf,
    cnae_fiscal_principal,
    count() as total
FROM cnpj_analytics.estabelecimentos
GROUP BY uf, cnae_fiscal_principal;

-- MV: Natalidade das Empresas (Novos CNPJs por mês)
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_natalidade_mensal
ENGINE = SummingMergeTree()
ORDER BY (ano_mes) AS
SELECT 
    -- Transforma para o primeiro dia do mês para agrupar
    toStartOfMonth(data_inicio_atividade) as ano_mes, 
    count() as novos_cnpjs
FROM cnpj_analytics.estabelecimentos
WHERE data_inicio_atividade IS NOT NULL
GROUP BY ano_mes;