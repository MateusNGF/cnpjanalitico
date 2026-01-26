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
        c.descricao as label,
        sum(r.total) as value
    FROM mv_cnae_ranking r
    JOIN dim_cnae c ON r.cnae_fiscal_principal = c.codigo
    WHERE r.uf = {uf:String}
    GROUP BY label
    ORDER BY value DESC
    LIMIT 1
  `,

  // 2. Trend Chart (Market Dynamics)
  // Real-time aggregation of openings vs closings
  TREND_CHART: `
    SELECT 
        n.ano_mes as month,
        n.novos_cnpjs as natalidade,
        m.empresas_baixadas as mortalidade
    FROM mv_natalidade_mensal n
    LEFT JOIN mv_mortalidade_mensal m ON n.ano_mes = m.ano_mes AND n.uf = m.uf
    WHERE n.uf = {uf:String}
    ORDER BY month ASC
    LIMIT 12
  `,

  // 3. Map Distribution (Discovery Engine)
  // Uses pre-calculated density view
  MAP_DENSITY: `
    SELECT 
        m.codigo_ibge as id,
        m.descricao as nome,
        sum(r.total) as value
    FROM dim_municipios m
    JOIN dim_estados e ON m.uf = CAST(e.codigo_uf AS String)
    LEFT JOIN mv_ranking_bairros r ON r.municipio = m.codigo
    WHERE e.sigla = {uf:String}
    GROUP BY m.codigo_ibge, m.descricao
  `,

  // 4. Lead Prospecting (Operational Layer)
  // Complex view joining Partners, Address, and Market Segmentation
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
  `
}
