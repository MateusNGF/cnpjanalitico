# 📋 Backlog de Implementação: CNPJ Analítico v2.0

Este documento traduz os objetivos estratégicos em tarefas técnicas acionáveis, divididas por módulo e prioridade.

---

## 🏗️ 1. Infraestrutura e UI/UX (Prioridade: Alta)

### [UI-001] Implementação de Mapas "Premium Dark"
*   **Descrição:** Alterar a camada de tiles do Leaflet para uma versão escura.
*   **Dados:** `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
*   **Objetivo:** Eliminar o contraste excessivo entre o mapa claro e o dashboard dark.

### [UI-002] Sistema de Design e Variáveis de Cor (Neon)
*   **Descrição:** Mapear variáveis CSS para cores de destaque (accent-colors).
*   **Cores:** `--status-success` (Neon Green), `--status-threat` (Vibrant Red), `--status-info` (Cyan).

### [UI-003] Refinamento de Micro-interações
*   **Descrição:** Adicionar `framer-motion` em transições de página e estados de hover nos cards de métricas.

---

## 📈 2. Inteligência de Mercado (Prioridade: Alta)

### [INT-001] Cálculo de Net Churn (Aberturas vs Fechamentos)
*   **Descrição:** Criar query no ClickHouse ou Materialized View para calcular o saldo de empresas ativas em prazos móveis (30, 90, 180 dias).

### [INT-002] Implementação do Time-lapse Slider
*   **Descrição:** No componente `MarketMap.tsx`, adicionar um slider temporal que filtra a data de início de atividade.

### [INT-003] Indicador de Sobrevivência (2 anos)
*   **Descrição:** Criar métrica no backend que compara empresas abertas há exatamente 2 anos e quantas ainda estão com situação "Ativa".

---

## 🕵️‍♂️ 3. Prospecção B2B (Prioridade: Média)

### [LEAD-001] Ferramenta de Seleção no Mapa (Draw Tool)
*   **Descrição:** Integrar `react-leaflet-draw` para permitir que o usuário desenhe áreas personalizadas e retorne os CNPJs contidos.

### [LEAD-002] Filtro Dinâmico de Capital Social
*   **Descrição:** Adicionar um componente de `RangeSlider` para filtrar empresas por faixas de Capital Social.

### [LEAD-004] Sistema de Exportação via Streaming
*   **Descrição:** Implementar API de download que gera CSV em tempo real via streaming para evitar timeouts em listas grandes.

---

## 🛡️ 4. Compliance & Risco (Prioridade: Alta)

### [RISK-001] Detecção de "Fábrica de CNPJs" (Endereços)
*   **Descrição:** Algoritmo que agrupa empresas por logradouro e número, disparando alerta visual se o número de CNPJs ultrapassar um limite (ex: 50) no mesmo endereço.

### [RISK-002] Grafo Societário (MVP)
*   **Descrição:** Integrar biblioteca de grafos (ex: `react-force-graph` ou `vis.js`) para visualizar a relação entre CNPJs e Sócios.

---

## 📊 5. Dados e Integração (Prioridade: Média)

### [DATA-001] Enriquecimento com Dados IBGE
*   **Descrição:** Importar tabela de população e renda média por município/estado para permitir cálculos de "Densidade por Habitante".

### [DATA-002] Materialização de Rankings (Performance)
*   **Descrição:** Criar `Materialized Views` no ClickHouse para o ranking de CNAEs e Municípios, eliminando a necessidade de `COUNT(*)` em tempo real no dashboard.

---
*Demandas geradas em 21/01/2026 com base nos novos casos de uso e proposta v2.0.*
