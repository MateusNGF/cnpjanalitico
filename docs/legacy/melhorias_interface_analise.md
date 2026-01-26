# 🚀 Melhorias de Interface e Inteligência: CNPJ Analítico

Este documento apresenta uma visão estratégica para elevar o patamar da interface (UI/UX) e a profundidade analítica da plataforma, transformando dados brutos em decisões de negócio.

---

## 1. Diretrizes de Interface (UI/UX)

O dashboard já possui um **Dark Mode** elegante. Para refiná-lo, propomos:

### 1.1. Estética e Imersão
*   **Mapas Temáticos:** Substituir o `TileLayer` padrão por estilos escuros (`CartoDB Dark` ou `Mapbox Dark`).
    *   *Benefício:* Maior contraste com marcadores e heatmaps, eliminando o "ofuscamento" do modo claro.
*   **Micro-interações:** Adicionar animações de entrada (`framer-motion`) e tooltips informativos em cada métrica.
*   **Paleta de Cores Neon:** Utilizar cores vibrantes (Verde Esmeralda, Azul Ciano, Rosa Magenta) para destacar insights positivos, neutros e críticos, respectivamente.

---

## 2. Inteligência e Métricas Derivadas

Além de contagens simples, a plataforma deve entregar **indicadores preditivos**.

### 2.1. Métricas de Crescimento e Risco
*   **Net Churn Econômico:** Saldo entre aberturas e fechamentos por região.
*   **Taxa de Sobrevivência (2 anos):** Percentual de empresas que sobrevivem ao período crítico inicial.
*   **Score de Localização:** Nota de 0 a 100 baseada na densidade de serviços complementares na área (ex: Farmácias próximas a Hospitais).

---

## 3. Planejamento por Abas

### 📈 Inteligência de Mercado
*   **Time-lapse Slider:** Visualizar a expansão comercial em um mapa histórico (2020 -> 2026).
*   **Mapa de Oportunidade (White Space):** Identificar áreas com alta densidade populacional mas baixa oferta de serviços específicos.

### 🕵️‍♂️ Prospecção B2B
*   **Ferramenta de Laço (Draw Tool):** Seleção de leads no mapa desenhando polígonos manuais.
*   **Filtro de Porte por Capital:** Segmentar leads pelo potencial de investimento (Capital Social).

### 🛡️ Compliance & Risco
*   **Grafo de Relacionamento (QSA):** Visualizar conexões entre sócios e identificar "Laranjas" ou endereços com concentração excessiva de CNPJs.
*   **Matriz de Risco Setorial:** Gráfico de pizza comparando % de empresas Inaptas vs Ativas em um setor.

---

## 4. Estratégia de Dados (Back-end)
*   **Materialized Views:** Pré-agregados no ClickHouse para garantir que calculos complexos (como HHI ou Ticket Médio) sejam instantâneos.
*   **Enriquecimento IBGE:** Integrar dados de renda média por setor censitário para refinar a análise de mercado.
