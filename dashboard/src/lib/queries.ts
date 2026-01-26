export const QUERIES = {
  // 1. KPI Cards (Overview)
  // Consumes MVs: mv_resumo_uf, mv_natalidade_mensal, mv_stats_sobrevivencia
  KPI_CAPITAL_SOCIAL: `
    SELECT 
        sum(capital_total_setor) as total_market_volume
    FROM v_concentracao_mercado
    WHERE uf = {uf}
  `,

  KPI_NATALIDADE: `
    SELECT 
        sum(novos_cnpjs) as new_companies
    FROM mv_natalidade_mensal
    WHERE uf = {uf} AND ano_mes >= toStartOfMonth(now())
  `,

  KPI_SURVIVAL_RATE: `
    SELECT 
        avg(tempo_vida_anos) as survival_index
    FROM mv_stats_sobrevivencia
    WHERE uf = {uf}
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
    WHERE n.uf = {uf}
    ORDER BY month ASC
    LIMIT 12
  `,

  // 3. Map Distribution (Discovery Engine)
  // Uses pre-calculated density view
  MAP_DENSITY: `
    SELECT 
        m.codigo_ibge as id,
        r.total as value
    FROM mv_resumo_municipio r
    JOIN dim_municipios m ON r.municipio = m.codigo
    WHERE r.uf = {uf}
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
        l.uf = {uf} 
        AND l.municipio = {municipio}
        AND l.situacao_cadastral = '02' -- Ativa
    LIMIT 100
  `
}
