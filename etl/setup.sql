-- setup_optimized.sql
-- Script de Inicialização Otimizado para ClickHouse (CNPJ Analítico)

CREATE DATABASE IF NOT EXISTS cnpj_analytics;

-- --------------------------------------------------------
-- 1. Tabelas de Dimensão
-- Alterado para MergeTree para permitir consultas flexíveis e persistência em disco
-- --------------------------------------------------------

-- Tabela de Estados
CREATE TABLE IF NOT EXISTS cnpj_analytics.dim_estados (
    codigo_uf UInt8,
    nome String,
    sigla FixedString(2),
    flag_url String,
    regiao String,
    coordenadas Point -- Centroide do estado
) ENGINE = MergeTree()
ORDER BY codigo_uf;

-- Tabela de Municípios Otimizada
CREATE TABLE IF NOT EXISTS cnpj_analytics.dim_municipios (
    codigo FixedString(4), 
    descricao String,
    codigo_ibge FixedString(7),
    uf FixedString(2),
    coordenadas Point -- Agrupa Lat/Long em um único objeto binário
) ENGINE = MergeTree() 
ORDER BY codigo;

CREATE TABLE IF NOT EXISTS cnpj_analytics.dim_cnae (
    codigo String, -- Pode conter caracteres especiais ou ser numérico
    descricao String,
    INDEX idx_cnae_desc descricao TYPE tokenbf_v1(1024, 3, 0) GRANULARITY 4,
    INDEX idx_cnae_ngram descricao TYPE ngrambf_v1(4, 1024, 3, 0) GRANULARITY 1
) ENGINE = MergeTree() ORDER BY codigo;

-- Dicionários em Memória para Performance Instantânea
CREATE DICTIONARY IF NOT EXISTS cnpj_analytics.dict_cnae (
    codigo String,
    descricao String
)
PRIMARY KEY codigo
SOURCE(CLICKHOUSE(TABLE 'dim_cnae' DB 'cnpj_analytics' USER 'default'))
LIFETIME(MIN 0 MAX 3600)
LAYOUT(HASHED());

CREATE DICTIONARY IF NOT EXISTS cnpj_analytics.dict_municipios (
    codigo String,
    descricao String,
    codigo_ibge String
)
PRIMARY KEY codigo
SOURCE(CLICKHOUSE(TABLE 'dim_municipios' DB 'cnpj_analytics' USER 'default'))
LIFETIME(MIN 0 MAX 3600)
LAYOUT(HASHED());

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
    correio_eletronico String CODEC(ZSTD(1)),
    INDEX idx_fantasia nome_fantasia TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 4,
    INDEX idx_bairro bairro TYPE bloom_filter(0.01) GRANULARITY 1
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

-- MV: Ranking de CNAE por Município
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_cnae_municipio_ranking
ENGINE = SummingMergeTree()
ORDER BY (uf, municipio, cnae_fiscal_principal) AS
SELECT 
    uf,
    municipio,
    cnae_fiscal_principal,
    count() as total
FROM cnpj_analytics.estabelecimentos
GROUP BY uf, municipio, cnae_fiscal_principal;

-- MV: Segmentação por Porte (MEI, Pequena, Grande)
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_segmentacao_porte
ENGINE = SummingMergeTree()
ORDER BY (uf, municipio, porte) AS
SELECT 
    uf,
    municipio,
    CASE 
        WHEN s.opcao_pelo_mei = 'S' THEN 'MEI'
        WHEN emp.porte_empresa = '01' THEN 'GRANDE'
        WHEN emp.porte_empresa IN ('03', '05') THEN 'PEQUENA'
        ELSE 'OUTROS'
    END as porte,
    count() as total
FROM cnpj_analytics.estabelecimentos e
LEFT JOIN cnpj_analytics.empresas emp ON e.cnpj_basico = emp.cnpj_basico
LEFT JOIN cnpj_analytics.simples s ON e.cnpj_basico = s.cnpj_basico
WHERE e.situacao_cadastral = '02'
GROUP BY uf, municipio, porte;

-- MV: Balanço de Mercado (Natalidade e Mortalidade Unificadas)
-- Elimina JOIN no gráfico de tendências
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_balanco_mercado
ENGINE = SummingMergeTree()
ORDER BY (uf, ano_mes) AS
SELECT 
    uf,
    toStartOfMonth(coalesce(data_inicio_atividade, data_situacao_cadastral, toDate('1900-01-01'))) as ano_mes,
    countIf(situacao_cadastral = '02') as natalidade,
    countIf(situacao_cadastral = '08') as mortalidade
FROM cnpj_analytics.estabelecimentos
GROUP BY uf, ano_mes;

-- MV: Natalidade das Empresas (Novos CNPJs por mês)
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_natalidade_mensal
ENGINE = SummingMergeTree()
ORDER BY (uf, ano_mes) AS
SELECT 
    uf,
    -- Transforma para o primeiro dia do mês para agrupar
    toStartOfMonth(coalesce(data_inicio_atividade, toDate('1900-01-01'))) as ano_mes, 
    count() as novos_cnpjs
FROM cnpj_analytics.estabelecimentos
WHERE data_inicio_atividade IS NOT NULL
GROUP BY uf, ano_mes;

-- MV: Resumo por Município (Densidade para o Mapa)
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_resumo_municipio 
ENGINE = SummingMergeTree() 
ORDER BY (uf, municipio) AS
SELECT 
    uf, 
    municipio, 
    count() as total
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '02' -- Apenas Ativas para o Mapa de Calor
GROUP BY uf, municipio;

-- --------------------------------------------------------
-- 5. Views de Inteligência de Negócio e Georeferenciamento
-- --------------------------------------------------------

-- MV: Ranking de Bairros (Onde estão as empresas por setor)
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_ranking_bairros
ENGINE = SummingMergeTree()
ORDER BY (uf, municipio, bairro, cnae_fiscal_principal) AS
SELECT 
    uf,
    municipio,
    bairro,
    cnae_fiscal_principal,
    count() as total
FROM cnpj_analytics.estabelecimentos
WHERE bairro != ''
GROUP BY uf, municipio, bairro, cnae_fiscal_principal;

-- MV: Densidade por Logradouro (Polos comerciais)
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_densidade_logradouro
ENGINE = SummingMergeTree()
ORDER BY (uf, municipio, logradouro) AS
SELECT 
    uf,
    municipio,
    logradouro,
    count() as total
FROM cnpj_analytics.estabelecimentos
WHERE logradouro != ''
GROUP BY uf, municipio, logradouro;

-- VIEW: Lead Completo (Visão unificada para o Front-end)
-- Esta view facilita a busca sem precisar fazer JOINs manuais no código do app
CREATE VIEW IF NOT EXISTS cnpj_analytics.v_lead_completo AS
SELECT 
    e.cnpj_basico,
    e.cnpj_ordem,
    e.cnpj_dv,
    emp.razao_social,
    e.nome_fantasia,
    e.situacao_cadastral,
    e.data_situacao_cadastral,
    e.cnae_fiscal_principal,
    c.descricao as cnae_descricao,
    e.tipo_logradouro,
    e.logradouro,
    e.numero,
    e.complemento,
    e.bairro,
    e.cep,
    e.uf,
    e.municipio,
    m.descricao as municipio_nome,
    e.ddd1,
    e.telefone1,
    e.correio_eletronico,
    emp.capital_social,
    emp.porte_empresa,
    emp.natureza_juridica
FROM cnpj_analytics.estabelecimentos e
LEFT JOIN cnpj_analytics.empresas emp ON e.cnpj_basico = emp.cnpj_basico
LEFT JOIN cnpj_analytics.dim_cnae c ON e.cnae_fiscal_principal = c.codigo
LEFT JOIN cnpj_analytics.dim_municipios m ON e.municipio = m.codigo;

-- --------------------------------------------------------
-- 6. Advanced Analytics & Enrichment
-- Novas views para inteligência de mercado e análise de risco
-- --------------------------------------------------------

-- MV: Mortalidade de Empresas (Churn/Baixas)
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_mortalidade_mensal
ENGINE = SummingMergeTree()
ORDER BY (ano_mes, uf) AS
SELECT 
    toStartOfMonth(coalesce(data_situacao_cadastral, toDate('1900-01-01'))) as ano_mes,
    uf,
    count() as empresas_baixadas
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '08' -- Código usual para BAIXADA
GROUP BY ano_mes, uf;

-- MV: Serial Entrepreneurs (Sócios com múltiplas empresas)
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_top_socios
ENGINE = SummingMergeTree()
ORDER BY (nome_socio_hash) AS
SELECT 
    sipHash64(nome_socio) as nome_socio_hash, -- Hash para performance e privacidade
    any(nome_socio) as nome_exibicao,
    count() as qtd_empresas,
    uniq(cnpj_basico) as qtd_cnpjs_unicos
FROM cnpj_analytics.socios
WHERE nome_socio != ''
GROUP BY nome_socio_hash;

-- VIEW: Segmentação de Mercado por Porte Real (Estimativa)
-- Combina Capital Social e Regime Tributário para granularidade fina
CREATE VIEW IF NOT EXISTS cnpj_analytics.v_segmentacao_mercado AS
SELECT 
    e.cnpj_basico,
    e.uf,
    CASE 
        WHEN emp.capital_social > 10000000 THEN 'Corporativo (>10M)'
        WHEN emp.capital_social > 1000000 THEN 'Médio Porte (1M-10M)'
        WHEN s.opcao_pelo_mei = 'S' THEN 'MEI'
        ELSE 'Pequeno Porte'
    END as segmento_estimado,
    c.descricao as setor_atividade
FROM cnpj_analytics.estabelecimentos e
JOIN cnpj_analytics.empresas emp ON e.cnpj_basico = emp.cnpj_basico
LEFT JOIN cnpj_analytics.simples s ON e.cnpj_basico = s.cnpj_basico
LEFT JOIN cnpj_analytics.dim_cnae c ON e.cnae_fiscal_principal = c.codigo
WHERE e.situacao_cadastral = '02'; -- Apenas Ativas

-- MV: Faixa Etária das Empresas (Maturidade do Negócio)
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_faixa_idade_empresas
ENGINE = SummingMergeTree()
ORDER BY (uf, faixa_idade) AS
SELECT
    uf,
    CASE
        WHEN dateDiff('year', coalesce(data_inicio_atividade, toDate('1900-01-01')), now()) < 1 THEN '0-1 Ano'
        WHEN dateDiff('year', coalesce(data_inicio_atividade, toDate('1900-01-01')), now()) < 3 THEN '1-3 Anos'
        WHEN dateDiff('year', coalesce(data_inicio_atividade, toDate('1900-01-01')), now()) < 5 THEN '3-5 Anos'
        ELSE '5+ Anos'
    END as faixa_idade,
    count() as total
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '02'
GROUP BY uf, faixa_idade;



-- A. Índice de Sobrevivência por Setor (Consultoria de Risco)
-- Para um consultor, saber quanto tempo uma empresa dura em determinado setor e região é vital.
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_stats_sobrevivencia
ENGINE = SummingMergeTree()
ORDER BY (uf, cnae_fiscal_principal, tempo_vida_anos) AS
SELECT 
    uf,
    cnae_fiscal_principal,
    dateDiff('year', coalesce(data_inicio_atividade, toDate('1900-01-01')), coalesce(data_situacao_cadastral, toDate('1900-01-01'))) as tempo_vida_anos,
    count() as total_empresas
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '08' -- Baixadas
  AND data_inicio_atividade IS NOT NULL 
  AND data_situacao_cadastral IS NOT NULL
GROUP BY uf, cnae_fiscal_principal, tempo_vida_anos;



-- B. Clusterização Geográfica (Ideal para Mapas de Calor)
-- Em vez de apenas bairros, usar o prefixo do CEP (5 dígitos) permite identificar polos comerciais/industriais com mais precisão no mapa sem sobrecarregar o front-end.
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

-- C. Concentração de Mercado (Market Share Estimado)
-- Ajuda o empresário a entender se o setor é dominado por grandes empresas ou se é pulverizado.
CREATE VIEW IF NOT EXISTS cnpj_analytics.v_concentracao_mercado AS
SELECT 
    uf,
    cnae_fiscal_principal,
    count() as total_unidades,
    sum(emp.capital_social) as capital_total_setor,
    avg(emp.capital_social) as ticket_medio_capital
FROM cnpj_analytics.estabelecimentos e
JOIN cnpj_analytics.empresas emp ON e.cnpj_basico = emp.cnpj_basico
WHERE e.situacao_cadastral = '02'
GROUP BY uf, cnae_fiscal_principal;