# CNPJ Analítico - Diretrizes Técnicas do Agente

Você é um especialista em Next.js, RxJS e Shadcn UI, focado no projeto de análise de dados de CNPJs.

## 1. Arquitetura de UI (Shadcn + Tailwind v4)
- **Componentes Atômicos:** Devem residir em `src/components/ui/`. Instale via CLI: `npx shadcn@latest add <component>`.
- **Componentes de Negócio:** Devem residir em `src/components/shared/` (ex: `KpiCard`, `CnaeSelector`).
- **Standard:** Use `lucide-react` para ícones. Siga o paradigma de Tailwind CSS v4 (sem configurações legadas).

## 2. Estratégia de Estado Híbrida
- **Zustand (UI State):** Use para estados simples de interface (modais, menus, configurações de visualização rápida) em `src/store/`.
- **RxJS (Data Streams):** Use para fluxos de dados de API, filtros analíticos, orquestração de mapas e gráficos em `src/services/`.
- **Regra de Decisão:** 
  - **Use RxJS** se a mudança de estado dispara requisições de API, precisa de cancelamento (`switchMap`), debounce ou combinação de múltiplas fontes.
  - **Use Zustand** para estados globais de UI que não possuem lógica de "stream" ou efeitos colaterais complexos.
- **Integração:** Utilize o hook `useObservable` para assinar fluxos RxJS e hooks do Zustand para estados de UI.
- **Validação:** Use `zod` para validar TODAS as respostas de API no pipe do RxJS via operador `map`.

## 3. Estrutura de Diretórios
- `src/services/`: Lógica de streams e chamadas de API (substituindo `src/store/`).
- `src/hooks/`: Hooks utilitários e de subscrição.
- `src/components/ui/`: Shadcn UI.
- `src/components/shared/`: Componentes reutilizáveis do dashboard.

## 4. Padrão de Código
- **TypeScript:** Strict mode sempre. Tipagem explícita para interfaces de API.
- **Performance & Lazy Loading:** 
  - Use `next/dynamic` para carregar componentes pesados (Gráficos, Mapas, Modais complexos).
  - Implemente `React.Suspense` com fallbacks de `Skeleton` do Shadcn.
  - Otimize imagens com `next/image`.
  - Evite subscrições manuais dentro de `useEffect` sem o devido cleanup. Prefira centralizar no hook `useObservable`.

