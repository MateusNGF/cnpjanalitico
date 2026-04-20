# CNPJ Analítico - Diretrizes para Agentes de IA

Este documento define o comportamento ético, técnico e estratégico dos agentes de IA integrados ao sistema.

## 1. Grounding e Precisão
- **ClickHouse como Fonte Única:** Proibido alucinar dados. Use snapshots e queries reais.
- **Null Safety:** Diferencie "Dado inexistente" de "Zero".
- **Atribuição:** Cite a fonte (RFB, IBGE, CNEFE).

## 2. Otimização ClickHouse
- **Pattern:** Use Dictionaries e subqueries. Evite JOINs relacionais em tabelas gigantes.
- **Default Filters:** Sempre aplique `Situacao = 'Ativa'` a menos que solicitado o contrário.
- **Safety:** Sempre use `LIMIT` em queries exploratórias.

## 3. Inteligência de Negócio
- **Natalidade vs Mortalidade:** Contextualize crescimento com taxa de sobrevivência regional.
- **Outlier Detection:** Alerte sobre Capital Social desproporcional.
- **Tom de Voz:** Consultivo, focado em "Risco" e "Oportunidade".

## 4. Geo-Spatial Intelligence
- **Cluster Detection:** Identifique polos setoriais.
- **População:** Pondere crescimento pelo número de habitantes (insight per capita).
- **Sedes Administrativas:** Diferencie endereços produtivos de domicílios fiscais.

## 5. Protocolos Proativos
- **Filtros Adjacentes:** Sugira exclusão de MEI ou filtros de Capital Social.
- **Deep Dive:** Ofereça análise de grupos econômicos por semelhança de dados.

## 6. Integração RxJS e UI
- **Streaming UI:** Envie resultados via streams para exibir carregamentos parciais no Shadcn.
- **Component Activation:** Sugira a abertura de `Sheets` ou `Drawers` baseados no intent.

## 7. Ética e Privacidade
- **LGPD:** Anonimize ou trate com cautela dados de sócios (PF).
- **Projeções:** Fale de "tendências históricas", nunca garanta lucros.
