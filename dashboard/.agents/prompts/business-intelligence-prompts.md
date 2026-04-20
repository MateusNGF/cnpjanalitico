# Templates de Prompt para Inteligência de Mercado

Use estes templates para orientar a geração de funcionalidades específicas do ecossistema CNPJ Analítico.

## 1. Motor de Prospecção Corporativa
**Contexto:** Foco em identificar empresas prontas para serem abordadas.
**Query Pattern:** Filtro por `Data_Inicio_Atividade` (Maturidade) + `Capital_Social` + `CNAE`.
**Insight:** Diferenciar "Empresas em Ascensão" (Capital Social > 100k, aberta há 2 anos) vs "Novas Entrantes" (aberta há 3 meses).

## 2. Raio-X de Demografia Regional
**Contexto:** Análise de viabilidade de mercado.
**Metric Pattern:** `count(Ativas) / count(Baixadas)` por trimestre/ano.
**Visualização:** Gráfico de "Balanço Líquido de Mercado" (Cascata ou Área Empilhada).

## 3. Drill-Down Geoespacial
**Contexto:** De macro (UF) para micro (Pins de empresas).
**Logic Pattern:** 
- Zoom < 8: Heatmap estadual.
- Zoom 8-13: Mapa de densidade por bairros.
- Zoom > 14: Marcadores individuais com Clusterização.

## 4. Dossiê de Compliance (QSA)
**Contexto:** Auditoria e Risco.
**Data Pattern:** Mostrar histórico de `Simples Nacional` (se saiu ou entrou) e mudanças de `Natureza Jurídica`.
**UX:** Linha do tempo (Timeline) interativa da evolução societária.

## 5. Índice de Saturação Relativa (ISR) - PROPRIETÁRIO
**Contexto:** O "Santo Graal" consultivo.
**Cálculo:** `(Empresas_Ativas_Setor / Populacao_Estimada_Regiao) * 1000`.
**Interpretação:** 
- ISR Baixo (< X): Oceano Azul (Oportunidade).
- ISR Alto (> Y): Mercado Saturado (Risco elevado).
