export const QUERIES = {
  // 1. KPI Cards (Overview)
  // Consumes MVs: mv_resumo_uf, mv_natalidade_mensal, mv_stats_sobrevivencia
  KPI_CAPITAL_SOCIAL: `
    SELECT 
        sum(capital_total_setor) as total_market_volume
    FROM v_concentracao_mercado
    WHERE uf = {uf:String}
  `,

  KPI_NATALIDADE: `
    SELECT 
        sum(total) as new_companies
    FROM mv_resumo_uf
    WHERE uf = {uf:String} AND situacao_cadastral = '02'
  `,

  KPI_SURVIVAL_RATE: `
    SELECT 
        avg(tempo_vida_anos) as survival_index
    FROM mv_stats_sobrevivencia
    WHERE uf = {uf:String}
  `,

  KPI_TOP_CNAE: `
    SELECT 
        dictGet('cnpj_analytics.dict_cnae', 'descricao', cnae_fiscal_principal) as label,
        sum(total) as value
    FROM mv_cnae_ranking
    WHERE uf = {uf:String}
    GROUP BY label
    ORDER BY value DESC
    LIMIT 5
  `,

  KPI_MUNICIPAL_TOP_CNAE: `
    SELECT 
        dictGet('cnpj_analytics.dict_cnae', 'descricao', cnae_fiscal_principal) as label,
        sum(total) as value
    FROM mv_cnae_municipio_ranking
    WHERE uf = {uf:String} 
      AND municipio = (SELECT codigo FROM dim_municipios WHERE codigo_ibge = {municipio_id:String} LIMIT 1)
    GROUP BY label
    ORDER BY value DESC
    LIMIT 5
  `,

  CNAE_SEARCH: `
    SELECT 
        dictGet('cnpj_analytics.dict_cnae', 'descricao', cnae_fiscal_principal) as label,
        sum(total) as value
    FROM mv_cnae_municipio_ranking
    WHERE uf = {uf:String}
      AND municipio = (SELECT codigo FROM dim_municipios WHERE codigo_ibge = {municipio_id:String} LIMIT 1)
      AND (label ILIKE {search:String} OR cnae_fiscal_principal ILIKE {search:String})
    GROUP BY label
    ORDER BY value DESC
    LIMIT 10
  `,

  // 2. Trend Chart (Market Dynamics)
  // Consumes Unified Balance View
  TREND_CHART: `
    SELECT 
        ano_mes as month,
        natalidade,
        mortalidade
    FROM mv_balanco_mercado
    WHERE uf = {uf:String}
    ORDER BY month ASC
    LIMIT 12
  `,

  // 3. Map Distribution (Discovery Engine)
  MAP_DENSITY: `
    SELECT 
        dictGet('cnpj_analytics.dict_municipios', 'codigo_ibge', municipio) as id,
        dictGet('cnpj_analytics.dict_municipios', 'descricao', municipio) as nome,
        sum(total) as value
    FROM mv_resumo_municipio
    WHERE uf = {uf:String}
    GROUP BY id, nome
  `,

  // 4. Lead Prospecting (Operational Layer)
  LEAD_LIST: `
    SELECT 
        l.razao_social,
        l.nome_fantasia,
        l.cnpj_basico || l.cnpj_ordem || l.cnpj_dv as cnpj_full,
        l.cnae_descricao,
        l.bairro,
        l.municipio,
        s.segmento_estimado as porte,
        l.situacao_cadastral,
        l.capital_social
    FROM v_lead_completo l
    JOIN v_segmentacao_mercado s ON l.cnpj_basico = s.cnpj_basico
    WHERE 
        l.uf = {uf:String} 
        AND l.municipio = {municipio:String}
        AND l.situacao_cadastral = '02' -- Ativa
    LIMIT 100
  `,

  KPI_SEGMENTACAO_PORTE: `
    SELECT 
        porte as label,
        sum(total) as value
    FROM mv_segmentacao_porte
    WHERE uf = {uf:String}
    GROUP BY label
  `
}
