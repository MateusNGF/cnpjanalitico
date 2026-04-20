-- setup_views_v2.sql
-- Camada de Consumo (GOLD) e Enriquecimento (SILVER)

-- Enriquecimento (SILVER)
CREATE OR REPLACE VIEW cnpj_silver.v_lead_completo AS
SELECT 
    e.cnpj_basico,
    e.cnpj_ordem,
    e.cnpj_dv,
    emp.razao_social,
    e.nome_fantasia,
    e.situacao_cadastral,
    e.data_situacao_cadastral,
    e.data_inicio_atividade,
    dateDiff('year', e.data_inicio_atividade, now()) as idade_anos,
    dateDiff('month', e.data_inicio_atividade, now()) as idade_meses,
    e.cnae_fiscal_principal,
    dictGet('cnpj_silver.dict_cnae', 'descricao', e.cnae_fiscal_principal) as cnae_descricao,
    e.tipo_logradouro,
    e.logradouro,
    e.numero,
    e.complemento,
    e.bairro,
    e.cep,
    e.uf,
    e.municipio,
    dictGet('cnpj_silver.dict_municipios', 'descricao', e.municipio) as municipio_nome,
    dictGet('cnpj_silver.dict_municipios', 'coordenadas', e.municipio) as municipio_coordenadas,
    e.ddd1,
    e.telefone1,
    e.correio_eletronico,
    emp.capital_social,
    emp.porte_empresa,
    emp.natureza_juridica,
    dictGet('cnpj_silver.dict_naturezas_juridicas', 'descricao', emp.natureza_juridica) as natureza_juridica_descricao,
    s.opcao_pelo_mei,
    CASE 
        WHEN s.opcao_pelo_mei = 'S' THEN 'MEI'
        WHEN emp.capital_social > 10000000 THEN 'Corporativo (>10M)'
        WHEN emp.capital_social > 1000000 THEN 'Médio Porte (1M-10M)'
        WHEN emp.porte_empresa = '01' THEN 'Micro Empresa'
        WHEN emp.porte_empresa = '03' THEN 'Pequeno Porte'
        ELSE 'Demais'
    END as porte_custom,
    round(
        least(100, 
            (log10(emp.capital_social + 1) * 8) + 
            if(idade_meses <= 6, 25, 0) + 
            if(s.opcao_pelo_mei == 'S', 0, 15) + 
            if(e.situacao_cadastral == '02', 10, 0)
        )
    ) as lead_score
FROM cnpj_silver.estabelecimentos e
LEFT JOIN cnpj_silver.empresas emp ON e.cnpj_basico = emp.cnpj_basico
LEFT JOIN cnpj_silver.simples s ON e.cnpj_basico = s.cnpj_basico;

-- Consumo (GOLD)
CREATE OR REPLACE VIEW cnpj_gold.v_lead_search AS SELECT * FROM cnpj_silver.v_lead_completo;

CREATE VIEW IF NOT EXISTS cnpj_gold.v_segmentacao_mercado AS
SELECT * FROM cnpj_silver.v_segmentacao_mercado;

-- Views de Análise (Agregadas)
CREATE VIEW IF NOT EXISTS cnpj_gold.v_balanco_uf AS
SELECT * FROM cnpj_gold.mv_resumo_uf;

CREATE VIEW IF NOT EXISTS cnpj_gold.v_natalidade_mensal AS
SELECT * FROM cnpj_gold.mv_natalidade_mensal;

