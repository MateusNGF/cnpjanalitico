# CNPJ Analítico - Diretrizes de UX/UI Modern Enterprise

Este documento define os padrões estéticos e de interação, focando em uma interface sóbria, eficiente e baseada na simplicidade do Shadcn UI puro.

## 1. Estética "Pure Shadcn & Modest Enterprise"
- **Minimalismo Funcional:** A interface deve ser limpa e direta. Evite decorações desnecessárias. O foco é o dado.
- **Paleta de Cores:** Uso estrito das escalas `Zinc` e `Slate`.
    - **Fundo:** `bg-background` (frequentemente `white` ou `zinc-950`).
    - **Bordas:** `border-input` ou `border-border`.
    - **Acentos:** Use cores vibrantes apenas em pontos de ação ou indicadores de KPI (ex: `indigo-600`, `emerald-600`).
- **Glassmorphism Sutil:** Utilize `backdrop-blur-sm` apenas em elementos flutuantes necessários (como headers fixos ou menus móveis), mantendo a transparência discreta.
- **Micro-sombras:** Use as sombras padrão do Shadcn (`shadow-sm` ou `shadow`). O objetivo é profundidade mínima para separação de camadas.

## 2. Experiência de Performance, Clareza e Lazy Loading
- **Standard Layout:** Siga rigorosamente os padrões de espaçamento do Shadcn. Use containers consistentes.
- **Lazy Loading Progressivo:** 
    - Toda seção pesada (Market Analysis, Geo-View) deve ser carregada sob demanda.
    - Use `Skeleton` loaders que mimetizem a estrutura final do componente para reduzir CLS (Cumulative Layout Shift).
- **Zero Heavy Reloads:** Mantido o uso de RxJS para transições fluidas, mas sem animações excessivas. A percepção de velocidade vem da simplicidade.

- **Dashboards Modestos:** 
    - Priorize tabelas limpas (`Table` do Shadcn) com filtros bem organizados.
    - Use `Cards` com cabeçalhos claros e sem bordas arredondadas exageradas.

## 3. Visualização de Dados Pragmática
- **GEO Inteligência:** Em vez de 3D complexo, foque em mapas 2D fluidos e limpos. Use cores de preenchimento (Chloropleth) para densidade em vez de extrusão.
- **Gráficos:** Use Recharts ou similar com o estilo minimalist do Shadcn (linhas finas, cores sólidas, sem gradientes chamativos).

## 4. Arquitetura de Filtros (O Funil Lógico)
- Orientação por clareza: Filtros sempre visíveis ou em um `Popover` organizado.
- Hierarquia de dados mantida: UF -> CNAE -> Município, garantindo que o usuário entenda o caminho da análise.

## 5. Micro-Interações Sobrias
- **Framer Motion:** Use apenas para transições suaves de entrada (`Fade In`) ou mudanças de estado de lista. Evite "elasticidade" ou movimentos rápidos.
- **Tooltips:** Siga o componente `Tooltip` padrão do Shadcn para explicações técnicas de KPIs.
