# 🎨 Spec: Frontend & UX Design System

Esta especificação define os padrões visuais e comportamentais da interface.

## 1. Princípios Estéticos (Apple-Inspired)
- **Cores:** Paleta neutra (Gray 50-950), Primary (Indigo/Blue 600).
- **Arredondamento:** `rounded-xl` (12px) para cards, `rounded-lg` (8px) para inputs.
- **Efeitos:** Backdrop blur (`glassmorphism`) em headers e sidebars.

## 2. Componentes de Dados
- **KPI Cards:** Devem SEMPRE incluir:
    - Título descritivo.
    - Valor principal formatado.
    - Indicador de tendência (Trend + Percentage).
    - Skeleton correspondente para `loading=true`.
- **Filtros:** Devem ser persistentes. Mudanças de filtros devem disparar o estado de `loading` global ou local.

## 3. Gestão de Estado (Zustand)
- Use a store central `useFilterStore`.
- Persistência obrigatória via `localStorage`.

## 4. Feedbacks
- **Toasts:** Usar para erros de exportação ou falhas de conexão.
- **Skeletons:** Usar o componente `Skeleton` do Shadcn para evitar layout shift.
