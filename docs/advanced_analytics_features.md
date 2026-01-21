# Features de Análise Avançada (Advanced Analytics)

Este documento detalha as novas funcionalidades de análise implementadas no banco de dados ClickHouse para o projeto CNPJ Analítico. Estas views e materialized views foram projetadas para suportar casos de uso de alta performance como inteligência de vendas, análise de mercado e compliance.

## 1. Visão Geral das Novas Funcionalidades

| Feature | Tipo | Descrição | Principais Casos de Uso |
| :--- | :--- | :--- | :--- |
| **Mortalidade Mensal** | `Materialized View` | Acompanha o fechamento (baixa) de empresas mês a mês. | Análise econômica, risco de crédito, churn de mercado. |
| **Top Sócios** | `Materialized View` | Identifica sócios com múltiplas empresas (serial entrepreneurs). | Detecção de grupos econômicos, análise de risco/fraude, prospecção de alto valor. |
| **Segmentação de Mercado** | `View` | Estima o porte real da empresa combinando Capital Social e Simples Nacional. | Segmentação de leads B2B, análise de concorrentes. |
| **Faixa Etária (Maturidade)** | `Materialized View` | Classifica empresas pelo tempo de atividade. | Identificação de startups vs empresas consolidadas. |

---

## 2. Detalhamento Técnico

### A. Mortalidade de Empresas (`mv_mortalidade_mensal`)

Esta view materializada agrega o número de empresas baixadas por mês e estado. É fundamental para calcular o "Saldo Líquido" de empresas quando cruzada com a `mv_natalidade_mensal`.

**Definição SQL:**
```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_mortalidade_mensal
ENGINE = SummingMergeTree()
ORDER BY (ano_mes, uf) AS
SELECT 
    toStartOfMonth(data_situacao_cadastral) as ano_mes,
    uf,
    count() as empresas_baixadas
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '08' -- Código para BAIXADA
GROUP BY ano_mes, uf;
```

### B. Serial Entrepreneurs (`mv_top_socios`)

Foca em identificar pessoas físicas ou jurídicas que são sócias de múltiplas empresas. Utiliza hashing no nome do sócio para otimizar a performance de agrupamento.

**Definição SQL:**
```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_top_socios
ENGINE = SummingMergeTree()
ORDER BY (nome_socio_hash) AS
SELECT 
    sipHash64(nome_socio) as nome_socio_hash,
    any(nome_socio) as nome_exibicao,
    count() as qtd_empresas,
    uniq(cnpj_basico) as qtd_cnpjs_unicos
FROM cnpj_analytics.socios
WHERE nome_socio != ''
GROUP BY nome_socio_hash;
```

### C. Segmentação de Mercado (`v_segmentacao_mercado`)

Uma View lógica (não materializada, calculada em tempo de execução) que enriquece os dados, criando categorias de porte mais realistas do que as padrão da Receita Federal.

**Regra de Negócio:**
- **Corporativo (>10M):** Capital Social acima de 10 milhões.
- **Médio Porte (1M-10M):** Capital Social entre 1 e 10 milhões.
- **MEI:** Optante pelo MEI.
- **Pequeno Porte:** Demais casos.

**Definição SQL:**
```sql
CREATE VIEW IF NOT EXISTS cnpj_analytics.v_segmentacao_mercado AS
SELECT 
    e.cnpj_basico,
    m.uf,
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
```

### D. Faixa Etária (`mv_faixa_idade_empresas`)

Classifica o parque de empresas ativas de acordo com sua "idade".

**Filtros:** Apenas empresas com Situação Cadastral '02' (Ativa).

**Definição SQL:**
```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS cnpj_analytics.mv_faixa_idade_empresas
ENGINE = SummingMergeTree()
ORDER BY (uf, faixa_idade) AS
SELECT
    uf,
    CASE
        WHEN dateDiff('year', data_inicio_atividade, now()) < 1 THEN '0-1 Ano'
        WHEN dateDiff('year', data_inicio_atividade, now()) < 3 THEN '1-3 Anos'
        WHEN dateDiff('year', data_inicio_atividade, now()) < 5 THEN '3-5 Anos'
        ELSE '5+ Anos'
    END as faixa_idade,
    count() as total
FROM cnpj_analytics.estabelecimentos
WHERE situacao_cadastral = '02'
GROUP BY uf, faixa_idade;
```

---

## 3. Como Utilizar

- **Para Dashboards:** Conecte ferramentas de BI (Superset, Metabase, Grafana) diretamente a estas Views e MVs para obter respostas em milissegundos.
- **Para Vendas:** Utilize a `v_segmentacao_mercado` para extrair listas de leads altamente qualificados.
- **Para Estudos:** Utilize as MVs temporal (`mortalidade` e `natalidade`) para gerar relatórios de tendências econômicas.
