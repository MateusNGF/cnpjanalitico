-- medallion_setup.sql
-- Implementação Revisada do Padrão Medalhão (Enterprise Grade)

-- 1. Bases de Dados
CREATE DATABASE IF NOT EXISTS cnpj_bronze; -- Raw Ingestion
CREATE DATABASE IF NOT EXISTS cnpj_silver; -- Cleaned & Enriched (Truth Source)
CREATE DATABASE IF NOT EXISTS cnpj_gold;   -- Dashboard & Analytics (Optimized)

-- --------------------------------------------------------
-- 1. CAMADA BRONZE (Audit & Raw)
-- --------------------------------------------------------
-- O motor Log() é ideal para ingestão rápida de dados brutos que não precisam de índices.
-- Representam a "fotografia" fiel do arquivo da Receita.

CREATE TABLE IF NOT EXISTS cnpj_bronze.raw_estabelecimentos (
    cnpj_basico String,
    cnpj_ordem String,
    cnpj_dv String,
    identificador_matriz_filial String,
    nome_fantasia String,
    situacao_cadastral String,
    data_situacao_cadastral String,
    motivo_situacao_cadastral String,
    nome_cidade_exterior String,
    pais String,
    data_inicio_atividade String,
    cnae_fiscal_principal String,
    cnae_fiscal_secundaria String,
    tipo_logradouro String,
    logradouro String,
    numero String,
    complemento String,
    bairro String,
    cep String,
    uf String,
    municipio String,
    ddd1 String,
    telefone1 String,
    ddd2 String,
    telefone2 String,
    ddd_fax String,
    fax String,
    correio_eletronico String,
    situacao_especial String,
    data_situacao_especial String,
    _ingestion_at DateTime DEFAULT now()
) ENGINE = Log();

-- --------------------------------------------------------
-- 2. CAMADA SILVER (Integridade & Relacionamentos)
-- --------------------------------------------------------
-- Tabelas tipadas (MergeTree) com Codecs e Particionamento.
-- Aqui os dados são enriquecidos com de-normalização básica.

-- NOTA: O script 'setup_tables_v2.sql' já cria estas tabelas no schema 'cnpj_silver'.
-- A revisão aqui foca em garantir que a Silver seja a "Source of Truth".

-- --------------------------------------------------------
-- 3. CAMADA GOLD (Performance & Negócio)
-- --------------------------------------------------------
-- Tabelas agregadas para sub-second dashboard performance.
-- Usamos SummingMergeTree para colunas métricas.

-- Exemplo de tabela Gold para o Dashboard Principal
CREATE TABLE IF NOT EXISTS cnpj_gold.dash_resumo_mercado (
    uf LowCardinality(FixedString(2)),
    municipio_nome String,
    cnae_descricao String,
    situacao_cadastral LowCardinality(String),
    total_empresas SimpleAggregateFunction(sum, UInt64),
    capital_total SimpleAggregateFunction(sum, Float64)
) ENGINE = SummingMergeTree()
ORDER BY (uf, municipio_nome, cnae_descricao, situacao_cadastral);

-- View de Consumo para o Frontend (Escondendo complexidade de schemas)
CREATE OR REPLACE VIEW cnpj_gold.v_leads AS 
SELECT * FROM cnpj_silver.v_lead_completo;

-- View para Ranking de Market Share
CREATE OR REPLACE VIEW cnpj_gold.v_market_share AS
SELECT 
    uf, 
    cnae_descricao, 
    count() as total 
FROM cnpj_silver.v_lead_completo 
GROUP BY uf, cnae_descricao;

-- --------------------------------------------------------
-- ESTRATÉGIA DE FLUXO (REVISADA)
-- --------------------------------------------------------
-- 1. [Bronze] Ingestão via S3/Filesystem para cnpj_bronze (String only)
-- 2. [Silver] Transformação (Polars ou SQL) para cnpj_silver (Typed + Codecs)
-- 3. [Gold] Materialized Views de cnpj_silver para cnpj_gold (Aggregated)
