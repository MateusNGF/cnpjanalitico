# Guia de Desenvolvimento Frontend

Este documento define os padrões visuais e técnicos para o desenvolvimento do dashboard do CNPJ Analítico.

## 🎨 Sistema de Design

Utilizamos uma abordagem de design premium baseada em glassmorphism, gradientes suaves e tipografia moderna.

### Variáveis Semânticas (CSS)

Sempre prefira o uso das variáveis semânticas definidas em `globals.css` em vez de valores hardcoded:

- `--header-height`: Altura padrão do cabeçalho.
- `--container-max-width`: Largura máxima recomendada para o conteúdo principal (1400px).
- `--glass-background` / `--glass-border`: Utilizados para criar o efeito de vidro em cards e overlays.
- `--surface-gradient`: Gradiente de fundo sutil para as páginas.
- `--brand-gradient`: Gradiente principal da marca.

### Tokens de Responsividade

Utilize estas variáveis para garantir consistência entre breakpoints:

- `--content-padding`: Preenchimento lateral automático (ajusta de 1rem a 3rem).
- `--section-gap`: Espaçamento vertical entre blocos (ajusta de 1.5rem a 2.5rem).
- `--container-width`: Largura do container (100% em mobile, centralizado em desktop).

## 🧭 Navegação (Sidebar)

- **Comportamento**: A sidebar é colapsável no desktop para maximizar a área de trabalho.
- **Mobile**: Em telas pequenas, ela se transforma em um menu drawer acionado por um botão fixo no topo esquerdo.
- **States**: Utilizamos `isCollapsed` e `isMobileOpen` para gerenciar as transições e visibilidade.

## 🧱 Componentes Estruturais

Para manter a consistência em todas as páginas, utilize os componentes `PageHeader` e `PageContent`.

### PageHeader
Utilizado no topo de todas as páginas principais para exibir título, descrição, trilha (breadcrumbs) e ações.

```tsx
import { PageHeader } from "@/components/common/PageHeader";
import { Building2 } from "lucide-react";

<PageHeader
  title="Título da Página"
  description="Breve descrição da funcionalidade."
  icon={<Building2 className="h-6 w-6" />}
  breadcrumbs={[
    { label: "Pasta", href: "/caminho" },
    { label: "Página Atual" }
  ]}
  actions={<Button>Ação</Button>}
/>
```

### PageContent
Wrapper obrigatório para o conteúdo abaixo do `PageHeader`. Garante largura máxima centralizada, espaçamento padrão e animações de entrada.

```tsx
import { PageContent } from "@/components/common/PageContent";

<PageContent>
  {/* Conteúdo da página (Cards, Gráficos, Tabelas) */}
</PageContent>
```

## 📱 Responsividade

- **Containers**: Utilize sempre o componente `PageContent` como wrapper principal. Ele gerencia as variáveis `--content-padding` e `--container-width` automaticamente.
- **Grids**: Utilize padrões de colunas responsivos do Tailwind:
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--section-gap)]">
    {/* Itens */}
  </div>
  ```
- **Tabelas**: Utilize `overflow-x-auto` e force uma `min-w` na tabela se necessário para evitar esmagamento de dados em telas `sm`.

## 🌓 Tematização (Themes)

Componentes que dependem de renderização dinâmica (como mapas Leaflet ou Recharts) devem observar o tema atual via hook `useTheme` se CSS puro não for suficiente.

- **Mapas**: O `LeafletMap` alterna automaticamente entre tiles claros e escuros.
- **Camadas de Dados**: Camadas como `Choropleth` e `Heatmap` ajustam suas escalas cromáticas com base no `resolvedTheme`.
- **CSS Variables**: Sempre utilize variáveis `var(--color-...)` para cores que devem alternar entre light/dark.
