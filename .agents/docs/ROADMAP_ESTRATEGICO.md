# Roadmap Estratégico: CNPJ Analítico 🇧🇷

Este documento detalha a visão de futuro da plataforma, dividida em três horizontes de inovação. O objetivo é evoluir de um dashboard de visualização para uma central de inteligência de negócios.

---

## 🧭 Horizonte 1: Ativação Operacional (Leads e Conversão)
**Foco:** Transformar estatísticas em listas acionáveis de clientes e parceiros.

### 1.1 Módulo de Prospecção Municipal
- **Implementação:** Nova aba "Empresas" no painel `CityDetailSheet`.
- **Componentes Técnicos:**
    - Refatoração da query `LEAD_LIST` para paginação.
    - Componente de tabela responsiva com `Skeletons` de carregamento.
    - **Data Points:** Razão Social, Nome Fantasia, CNAE, Bairro, Data de Fundação, E-mail e Telefone (obscurecidos por padrão para LGPD, revelados sob demanda).
- **Funcionalidade de Exportação:** Botão para exportar a listagem filtrada para CSV/Excel com integração via API específica.

### 1.2 Filtros de Qualificação Corporativa
- **Filtro de Investimento:** Segmentação por faixas de Capital Social (ex: <100k, 100k-1M, >1M).
- **Filtro de Natureza Jurídica:** Utilizar `dict_naturezas` para focar em perfis específicos como S.A. (Sociedade Anônima) ou Entidades sem Fins Lucrativos.
- **Filtro de Maturidade:** Identificar empresas "Recém-Abertas" (leads para serviços de infraestrutura/contabilidade) vs "Consolidadas" (leads para expansão/investimento).

---

## 📍 Horizonte 2: Inteligência Geo-Espacial (Drill-Down)
**Foco:** Análise de micro-localização para expansão de endereços físicos.

### 2.1 Drill-Down por Bairro e CEP
- **Comportamento:** Ao clicar em um município, o mapa entra em modo "Micro-View", carregando a malha de sub-divisões (bairros ou prefixos de CEP de 5 dígitos).
- **Infraestrutura:** Utilizar a Materialized View `mv_ranking_bairros` e `mv_densidade_geografica` para gerar o calor temático por bairro.
- **Caso de Uso:** Identificar o bairro de uma capital (ex: Savassi em BH) com maior densidade de "Cafeterias" para evitar saturação.

### 2.2 Visualização de Pontos Individuais (Pins)
- **Implementação:** Abaixo de um certo nível de zoom, carregar marcadores individuais para as 50 maiores empresas da visão atual.
- **Interação:** Tooltips com mini-card de perfil da empresa ao passar o mouse sobre o pin.

---

## 🧠 Horizonte 3: Analytics Consultivo (Insights de Mercado)
**Foco:** Geração de valor através de cálculos proprietários de saturação e saúde.

### 3.1 Índice de Saturação Relativa (ISR)
- **Cálculo:** `(Número de Empresas Ativas no Setor / População Residente) * 1.000`.
- **Análise:** O sistema indicará em AZUL (Oceano Azul) áreas com baixa saturação e em VERMELHO (Saturação) áreas com excesso de oferta.
- **Impacto:** Ferramenta fundamental para franqueadores e novos empreendedores.

### 3.2 Score de Saúde Econômica Regional
- **Métrica:** Cruzar o Balanço de Mercado (Natalidade vs Mortalidade) com o PIB Municipal per capita.
- **Visualização:** Gráfico de quadrantes (Bolhas) comparando cidades. Cidades no quadrante superior direito são "Altamente Atrativas" (Alta abertura, Baixa mortalidade, Alto PIB).

---

## 🛠️ Requisitos Técnicos Transversais
- **ETL:** Incremento nos dados geográficos para suportar malhas de bairros.
- **API:** Implementação de limites de taxa (Rate Limiting) para evitar scrap excessivo.
- **Auth:** Preparação para sistema de Login (Auth.js) caso o acesso aos leads precise ser restrito ou monetizado.

---

> [!IMPORTANT]
> A prioridade recomendada segue a ordem numérica (1 a 6), garantindo que a base de dados em ClickHouse seja otimizada para suportar a complexidade crescente das consultas geográficas.
