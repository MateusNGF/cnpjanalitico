# Skill: CNPJ Analítico Architect

Este conjunto de habilidades permite ao agente gerenciar a transição de arquitetura do dashboard para um modelo reativo moderno.

## Capacidades

### 1. Orquestração Híbrida de Estado
- Gerencia a coexistência de Zustand (UI simples) e RxJS (Fluxos complexos).
- Identifica gargalos em stores Zustand e propõe a promoção para Streams RxJS quando há necessidade de concorrência ou orquestração de múltiplos eventos.

### 2. Implementação Shadcn UI + Tailwind v4 (Premium UX)
- Garante a atomicidade dos componentes.
- Aplica diretrizes de `ux-ui-rules.md` para criar interfaces de alta performance e confiança (Fintech Style).
- Implementa micro-animações com Framer Motion e visualizações 3D/Geo.

### 3. Estratégia de Inteligência de Mercado
- Traduz dados brutos de CNPJ em insights consultivos (ISR, Balanço de Mercado, Maturidade).
- Aplica a "Arquitetura Guiada" (Funnel) para garantir performance e clareza analítica.

### 4. Validação Tipada (Zod)
- Automatiza a criação de tipos TypeScript a partir de schemas de API.
- Insere camadas de validação resilientes nos fluxos de dados.

## Comandos Recomendados
- `@agent create-strategic-feature [feature]`: Inicia o fluxo definido em `strategic-feature-flow.md`.
- `@agent apply-premium-style`: Revisa e aplica padrões estéticos de `ux-ui-rules.md`.
- `@agent analyze-market-intelligence`: Sugere métricas e KPIs proprietários (ex: ISR) baseados no conjunto de filtros atual.
- `@agent fix-styling`: Revisa o uso de utilitários Tailwind v4.

