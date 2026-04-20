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
    LIMIT 5
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
  // Using direct JOIN instead of dictionary to avoid ClickHouse Cloud dict issues
  MAP_DENSITY: `
    SELECT 
        m.codigo_ibge as id,
        m.descricao as nome,
        sum(mv.total) as value
    FROM mv_resumo_municipio mv
    JOIN dim_municipios m ON mv.municipio = m.codigo
    WHERE mv.uf = {uf:String}
    GROUP BY id, nome
  `,

  // 4. Lead Prospecting (Operational Layer)
  // 4. Lead Prospecting (Operational Layer)
  // Optimized to use v_lead_completo + direct join to simples instead of joining two heavy views
  LEAD_LIST: `
    SELECT 
        l.razao_social,
        l.nome_fantasia,
        l.cnpj_basico || l.cnpj_ordem || l.cnpj_dv as cnpj_full,
        l.cnae_descricao,
        l.bairro,
        l.municipio_nome as municipio,
        l.porte_custom as porte,
        l.situacao_cadastral,
        l.capital_social,
        l.data_inicio_atividade,
        l.idade_anos,
        l.idade_meses
    FROM v_lead_completo l
    WHERE 
        l.uf = {uf:String} 
        AND ({municipio:String} = '' OR l.municipio = {municipio:String})
        AND l.situacao_cadastral = '02'
        AND l.capital_social >= {capital_min:Float64}
        AND l.capital_social <= {capital_max:Float64}
        AND (
            ({idade_min:Int32} = 0 AND {idade_max:Int32} = 0 AND l.idade_meses <= 6) -- Menos de 6 meses
            OR (NOT({idade_min:Int32} = 0 AND {idade_max:Int32} = 0) AND l.idade_anos >= {idade_min:Int32} AND l.idade_anos <= {idade_max:Int32})
        )
        AND ({natureza_juridica:String} = '' OR l.natureza_juridica = {natureza_juridica:String})
        AND ({cnae:String} = '' OR l.cnae_fiscal_principal = {cnae:String})
    LIMIT 100
  `,

  // MV removed due to OOM -> Using View with Logic
  KPI_SEGMENTACAO_PORTE: `
    SELECT 
        segmento_estimado as label,
        count() as value
    FROM v_segmentacao_mercado
    WHERE uf = {uf:String}
    GROUP BY label
  `
}
