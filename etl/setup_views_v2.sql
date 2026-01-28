-- setup_views_v2.sql
-- Views que dependem de Dicionários (Criados dinamicamente via ETL)

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
    dictGet('cnpj_analytics.dict_cnae', 'descricao', e.cnae_fiscal_principal) as cnae_descricao,
    e.tipo_logradouro,
    e.logradouro,
    e.numero,
    e.complemento,
    e.bairro,
    e.cep,
    e.uf,
    e.municipio,
    dictGet('cnpj_analytics.dict_municipios', 'descricao', e.municipio) as municipio_nome,
    e.ddd1,
    e.telefone1,
    e.correio_eletronico,
    emp.capital_social,
    emp.porte_empresa,
    emp.natureza_juridica,
    dictGet('cnpj_analytics.dict_naturezas_juridicas', 'descricao', emp.natureza_juridica) as natureza_juridica_descricao
FROM cnpj_analytics.estabelecimentos e
LEFT JOIN cnpj_analytics.empresas emp ON e.cnpj_basico = emp.cnpj_basico;

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
    dictGet('cnpj_analytics.dict_cnae', 'descricao', e.cnae_fiscal_principal) as setor_atividade
FROM cnpj_analytics.estabelecimentos e
JOIN cnpj_analytics.empresas emp ON e.cnpj_basico = emp.cnpj_basico
LEFT JOIN cnpj_analytics.simples s ON e.cnpj_basico = s.cnpj_basico
WHERE e.situacao_cadastral = '02';

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

-- --------------------------------------------------------
-- Views Helper para MVs com AggregatingMergeTree
-- --------------------------------------------------------
-- Estas views facilitam o consumo das MVs que usam funções -State,
-- aplicando automaticamente as funções -Merge correspondentes.

-- View para consultar análise de capital
CREATE VIEW IF NOT EXISTS cnpj_analytics.v_capital_analytics AS
SELECT 
    uf,
    natureza_juridica,
    sum(total_empresas) as total_empresas,
    sumMerge(capital_total_state) as capital_total,
    avgMerge(capital_medio_state) as capital_medio,
    quantileTDigestMerge(0.5)(mediana_capital_state) as mediana_capital,
    quantileTDigestMerge(0.95)(p95_capital_state) as p95_capital
FROM cnpj_analytics.mv_capital_analytics
GROUP BY uf, natureza_juridica;

-- View para consultar análise de sócios
CREATE VIEW IF NOT EXISTS cnpj_analytics.v_socios_analytics AS
SELECT 
    uf,
    qualificacao_socio,
    uniqCombinedMerge(socios_unicos_state) as socios_unicos,
    uniqCombinedMerge(empresas_com_socio_state) as empresas_com_socio,
    countMerge(total_vinculos_state) as total_vinculos
FROM cnpj_analytics.mv_socios_analytics
GROUP BY uf, qualificacao_socio;

