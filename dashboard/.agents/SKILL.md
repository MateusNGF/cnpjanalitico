# Skill: CNPJ Analítico Architect

Este conjunto de habilidades permite ao agente gerenciar a transição de arquitetura do dashboard para um modelo reativo moderno.

## Capacidades

### 1. Orquestração Híbrida de Estado
- Gerencia a coexistência de Zustand (UI simples) e RxJS (Fluxos complexos).
- Identifica gargalos em stores Zustand e propõe a promoção para Streams RxJS quando há necessidade de concorrência ou orquestração de múltiplos eventos.

### 2. Implementação Shadcn UI + Tailwind v4
- Garante a atomicidade dos componentes.
- Implementa composições complexas usando Radix UI.
- Aplica estilos seguindo as novas diretrizes do Tailwind v4 (CSS variables).

### 3. Validação Tipada (Zod)
- Automatiza a criação de tipos TypeScript a partir de schemas de API.
- Insere camadas de validação resilientes nos fluxos de dados.

## Comandos Recomendados
- `@agent refactor-to-rxjs [file]`: Analisa e refatora o estado de um arquivo.
- `@agent create-dashboard-feature [name]`: Gera a estrutura de serviço, schema e componente para uma nova funcionalidade.
- `@agent fix-styling`: Revisa o uso de utilitários Tailwind v4.
