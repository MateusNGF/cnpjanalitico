export const QUERIES = {
  // 1. KPI Cards (Overview)
  KPI_CAPITAL_SOCIAL: `
    SELECT 
        ifNull(sum(capital_social), 0) as total_market_volume
    FROM cnpj_silver.empresas
    WHERE cnpj_basico IN (
        SELECT cnpj_basico 
        FROM cnpj_silver.estabelecimentos 
        WHERE uf = {uf:String} AND situacao_cadastral = '02'
    )
  `,

  KPI_NATALIDADE: `
    SELECT 
        ifNull(count(), 0) as new_companies
    FROM cnpj_silver.estabelecimentos
    WHERE uf = {uf:String} AND situacao_cadastral = '02'
  `,

  KPI_SURVIVAL_RATE: `
    SELECT 
        ifNull(avg(dateDiff('year', data_inicio_atividade, data_situacao_cadastral)), 0) as survival_index
    FROM cnpj_silver.estabelecimentos
    WHERE uf = {uf:String} AND situacao_cadastral = '08' 
      AND data_inicio_atividade != toDate32('1900-01-01')
      AND data_situacao_cadastral != toDate32('1900-01-01')
  `,

  KPI_TOP_CNAE: `
    SELECT 
        dictGet('cnpj_silver.dict_cnae', 'descricao', cnae_fiscal_principal) as label,
        count() as value
    FROM cnpj_silver.estabelecimentos
    WHERE uf = {uf:String}
    GROUP BY label
    ORDER BY value DESC
    LIMIT 5
  `,

  KPI_MUNICIPAL_TOP_CNAE: `
    SELECT 
        dictGet('cnpj_silver.dict_cnae', 'descricao', cnae_fiscal_principal) as label,
        count() as value
    FROM cnpj_silver.estabelecimentos
    WHERE uf = {uf:String} 
      AND municipio = (SELECT codigo FROM cnpj_silver.dim_municipios WHERE codigo_ibge = {municipio_id:String} LIMIT 1)
    GROUP BY label
    ORDER BY value DESC
    LIMIT 5
  `,

  CNAE_SEARCH: `
    SELECT 
        dictGet('cnpj_silver.dict_cnae', 'descricao', cnae_fiscal_principal) as label,
        count() as value
    FROM cnpj_silver.estabelecimentos
    WHERE uf = {uf:String}
      AND municipio = (SELECT codigo FROM cnpj_silver.dim_municipios WHERE codigo_ibge = {municipio_id:String} LIMIT 1)
      AND (label ILIKE {search:String} OR cnae_fiscal_principal ILIKE {search:String})
    GROUP BY label
    ORDER BY value DESC
    LIMIT 5
  `,

  // 2. Trend Chart (Market Dynamics)
  TREND_CHART: `
    SELECT 
        toStartOfMonth(if(data_inicio_atividade = toDate32('1900-01-01'), data_situacao_cadastral, data_inicio_atividade)) as month,
        countIf(situacao_cadastral = '02') as natalidade,
        countIf(situacao_cadastral = '08') as mortalidade
    FROM cnpj_silver.estabelecimentos
    WHERE uf = {uf:String}
      AND (data_inicio_atividade != toDate32('1900-01-01') OR data_situacao_cadastral != toDate32('1900-01-01'))
    GROUP BY month
    ORDER BY month ASC
    LIMIT 12
  `,

  // 3. Map Distribution (Discovery Engine)
  MAP_DENSITY: `
    SELECT 
        m.codigo_ibge as id,
        m.descricao as nome,
        count() as value
    FROM (SELECT municipio FROM cnpj_silver.estabelecimentos WHERE uf = {uf:String} AND situacao_cadastral = '02') e
    JOIN cnpj_silver.dim_municipios m ON e.municipio = m.codigo
    GROUP BY id, nome
  `,

  // 4. Lead Prospecting (Operational Layer)
  // CRITICAL OPTIMIZATION: Use subqueries for BOTH sides to prevent loading redundant rows into memory
  LEAD_LIST: `
    WITH filtered_leads AS (
        SELECT 
            cnpj_basico,
            cnpj_ordem,
            cnpj_dv,
            nome_fantasia,
            cnae_fiscal_principal,
            bairro,
            municipio,
            situacao_cadastral,
            data_inicio_atividade
        FROM cnpj_silver.estabelecimentos
        WHERE 
            uf = {uf:String} 
            AND ({municipio:String} = '' OR municipio = {municipio:String})
            AND situacao_cadastral = {situacao:String}
            AND ({cnae:String} = '' OR cnae_fiscal_principal = {cnae:String})
        LIMIT 200
    )
    SELECT 
        emp.razao_social,
        e.nome_fantasia,
        e.cnpj_basico || e.cnpj_ordem || e.cnpj_dv as cnpj_full,
        dictGet('cnpj_silver.dict_cnae', 'descricao', e.cnae_fiscal_principal) as cnae_descricao,
        e.bairro,
        dictGet('cnpj_silver.dict_municipios', 'descricao', e.municipio) as municipio,
        if(s.opcao_pelo_mei = 'S', 'MEI', if(emp.capital_social > 1000000, 'Médio/Grande', 'Micro')) as porte,
        e.situacao_cadastral,
        emp.capital_social,
        e.data_inicio_atividade,
        dateDiff('year', e.data_inicio_atividade, now()) as idade_anos,
        dateDiff('month', e.data_inicio_atividade, now()) as idade_meses,
        e.cnpj_basico
    FROM filtered_leads e
    LEFT JOIN (
        SELECT cnpj_basico, razao_social, capital_social, natureza_juridica 
        FROM cnpj_silver.empresas 
        WHERE cnpj_basico IN (SELECT cnpj_basico FROM filtered_leads)
    ) emp ON e.cnpj_basico = emp.cnpj_basico
    LEFT JOIN (
        SELECT cnpj_basico, opcao_pelo_mei 
        FROM cnpj_silver.simples 
        WHERE cnpj_basico IN (SELECT cnpj_basico FROM filtered_leads)
    ) s ON e.cnpj_basico = s.cnpj_basico
    WHERE 
        emp.capital_social >= {capital_min:Float64}
        AND emp.capital_social <= {capital_max:Float64}
        AND (
            ({idade_min:Int32} = 0 AND {idade_max:Int32} = 0 AND dateDiff('month', e.data_inicio_atividade, now()) <= 6)
            OR (NOT({idade_min:Int32} = 0 AND {idade_max:Int32} = 0) AND dateDiff('year', e.data_inicio_atividade, now()) >= {idade_min:Int32} AND dateDiff('year', e.data_inicio_atividade, now()) <= {idade_max:Int32})
        )
        AND ({natureza_juridica:String} = '' OR emp.natureza_juridica = {natureza_juridica:String})
    LIMIT 100
  `,

  KPI_SEGMENTACAO_PORTE: `
    SELECT 
        if(porte_empresa = '01', 'Micro Empresa', if(porte_empresa = '03', 'Pequeno Porte', 'Demais')) as label,
        count() as value
    FROM cnpj_silver.empresas
    WHERE cnpj_basico IN (
        SELECT cnpj_basico 
        FROM (SELECT cnpj_basico FROM cnpj_silver.estabelecimentos WHERE uf = {uf:String} LIMIT 100000)
    )
    GROUP BY label
  `,

  // 5. Advanced Geo & Partners
  RANKING_BAIRROS: `
    SELECT 
        bairro as label,
        count() as value
    FROM (SELECT bairro, municipio FROM cnpj_silver.estabelecimentos WHERE uf = {uf:String} AND bairro != '')
    WHERE ({municipio_id:String} = '' OR municipio = (SELECT codigo FROM cnpj_silver.dim_municipios WHERE codigo_ibge = {municipio_id:String} LIMIT 1))
    GROUP BY label
    ORDER BY value DESC
    LIMIT 10
  `,

  CEP_DENSITY: `
    SELECT 
        substring(cep, 1, 5) as label,
        count() as value
    FROM (SELECT cep, cnae_fiscal_principal FROM cnpj_silver.estabelecimentos WHERE uf = {uf:String} AND situacao_cadastral = '02')
    WHERE ({cnae:String} = '' OR cnae_fiscal_principal = {cnae:String})
    GROUP BY label
    ORDER BY value DESC
    LIMIT 5
  `,

  LIST_PARTNERS: `
    SELECT 
        nome_socio as nome,
        qualificacao_socio as qualificacao
    FROM cnpj_silver.socios
    WHERE cnpj_basico = {cnpj_basico:String}
  `
}
