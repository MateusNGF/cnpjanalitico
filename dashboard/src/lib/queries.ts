export const QUERIES = {
  // 1. KPI Cards (Overview)
  // Consumes MVs: mv_resumo_uf, mv_natalidade_mensal, mv_stats_sobrevivencia
  KPI_CAPITAL_SOCIAL: `
    SELECT 
        sum(capital_social) as total_market_volume
    FROM mv_resumo_uf
    WHERE uf = {uf}
  `,

  KPI_NATALIDADE: `
    SELECT 
        count() as new_companies
    FROM mv_natalidade_mensal
    WHERE uf = {uf} AND mes_referencia >= toStartOfMonth(now())
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
        toStartOfMonth(data_evento) as month,
        countIf(tipo_evento = 'ABERTURA') as natalidade,
        countIf(tipo_evento = 'BAIXA') as mortalidade
    FROM estabelecimentos_eventos
    WHERE uf = {uf}
    GROUP BY month
    ORDER BY month ASC
  `,

  // 3. Map Distribution (Discovery Engine)
  // Uses pre-calculated density view
  MAP_DENSITY: `
    SELECT 
        municipio,
        count() as total_active_companies,
        sum(capital_social) as density_value
    FROM mv_resumo_uf
    WHERE uf = {uf}
    GROUP BY municipio
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
