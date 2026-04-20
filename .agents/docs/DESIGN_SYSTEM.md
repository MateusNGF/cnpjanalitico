# Sistema de Design & Layout - CNPJ Analítico

> [!IMPORTANT]
> Este documento é a fonte da verdade para o desenvolvimento frontend. Novas funcionalidades **devem** seguir estritamente estes padrões para manter a consistência visual e arquitetural.

## 1. Princípios de UX/UI
O sistema adota uma estética **"Data-Heavy, but Light"**.
- **Densidade**: Alta densidade de informação é permitida, desde que organizada.
- **Glassmorphism**: Usado para separar camadas (Mapas > Paineis > Modais) sem bloquear o contexto visual.
- **Micro-interações**: Hover effects suaves e transitions (`duration-300`) são mandatórios em elementos interativos.

---

## 2. Paleta de Cores (OKLCH)
Utilizamos o espaço de cor OKLCH via Tailwind v4 para garantir constância de luminância entre temas Claro/Escuro.

### Definições Semânticas (`globals.css`)
| Token | Descrição |
|---|---|
| `--background` | Base da interface. Branco (Claro) ou Preto Profundo (Escuro). |
| `--primary` | A cor de marca/ação. Preto (Claro) ou Branco (Escuro). |
| `--muted/5` | Usado para fundos de cards "glass" (ex: `bg-muted/5`). |
| `--chart-n` | Série de 5 cores (`chart-1` a `chart-5`) para visualização de dados. |

> **Regra de Ouro**: Nunca use cores hexadecimais (`#fff`) diretamente. Use as classes semânticas (`bg-background`, `text-primary`).

---

## 3. Arquitetura de Layout

Todo página deve ser construída sobre dois pilares fundamentais localizados em `src/components/common/`.

### 3.1. `PageHeader`
Padroniza o título, navegação e ações da página.

```tsx
<PageHeader
  title="Título da Página"
  description="Uma breve explicação do propósito desta tela."
  icon={<LucideIcon className="h-6 w-6" />}
  breadcrumbs={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Seção Atual" }
  ]}
  actions={
    <Button>Ação Principal</Button>
  }
/>
```

### 3.2. `PageContent`
Wrapper que garante o espaçamento correto e animações de entrada.

```tsx
<PageContent>
  <PageHeader ... />
  <div className="grid...">
    {/* Conteúdo da página */}
  </div>
</PageContent>
```

---

## 4. Biblioteca de Componentes

### Cards de KPI (`KPICard`)
Utilizados no topo de dashboards.
- **Design**: Borda sutil, gradiente de fundo muito leve.
- **Conteúdo**: Título pequeno, Valor Gigante, Tendência (verde/vermelho).

### Mapas (`MasterMap`, `MapContainer`)
- **Engine**: React Leaflet.
- **Carregamento**: Sempre via `next/dynamic` com `ssr: false` para evitar hydration mismatch.
- **Estilo**: Mapas escuros ("CartoDB Dark Matter") para contraste com layers de dados coloridos.

### Tabelas (`DataTable`)
- Use `shadcn/ui` Table.
- Cabeçalhos: Uppercase, texto pequeno, `text-muted-foreground`.
- Linhas: `hover:bg-muted/50` para legibilidade.

---

## 5. Diretrizes de Código

### Formatação de Dados (`lib/utils.ts`)
Não formate números manualmente. Use os helpers:
- `formatCurrency(1500)` → `R$ 1.500,00`
- `formatNumber(1500000)` → `1.5M`
- `formatQuantity(1200)` → `1.200`
- `formatCNPJ(...)` / `formatCNAE(...)`

### Importações
Priorize caminhos absolutos:
- `import { ... } from "@/components/common/PageHeader"` (Certo)
- `import { ... } from "../../components/header"` (Errado)

---

## 6. Próximos Passos (Roadmap de Design)
1. Implementar "Skeleton Screens" customizados para cada tipo de gráfico.
2. Padronizar as páginas de erro (`not-found.tsx`, `error.tsx`) com a mesma identidade visual.
3. Criar uma biblioteca de ícones de setor (ex: Ícone específico para "Agronegócio", "Varejo") para enriquecer as listas.
