# Guia de Gerenciamento de Estado com Zustand

Este projeto utiliza o **Zustand** para gerenciamento de estado global e cache de consultas ao ClickHouse. Ele substitui o antigo `DashboardContext` (React Context) para melhor performance e facilidade de manutenção.

## Estrutura de Stores

Os stores estão localizados em `src/store/`.

### 1. `useFilterStore`
Gerencia todos os filtros globais aplicados ao dashboard.

**Estados:**
- `uf`: Estado/UF selecionado (Padrão: 'BR').
- `city`: Município/Código IBGE.
- `cnae`: Código CNAE.
- `situacao`: Situação Cadastral.
- `naturezaJuridica`: Natureza Jurídica.
- `capitalSocial`: Range de capital social.
- `dateRange`: Período de abertura.

**Exemplo de Uso:**
```tsx
import { useFilterStore } from "@/store/use-filter-store"

const uf = useFilterStore(s => s.uf)
const setUf = useFilterStore(s => s.setUf)
```

### 2. `useDataStore`
Gerencia a busca de dados (fetching) e o estado das requisições para as APIs do ClickHouse.

**Módulos:**
- `stats`: KPIs gerais (Capital, Natalidade, Sobrevivência).
- `map`: Dados para o Mapa de Municípios.
- `trends`: Dados de séries temporais (Aberturas vs Mortes).
- `leads`: Listagem de empresas para prospecção.

**Exemplo de Uso em Componente:**
```tsx
import { useDataStore } from "@/store/use-data-store"
import { useFilterStore } from "@/store/use-filter-store"

const filters = useFilterStore()
const { data: stats, loading } = useDataStore(s => s.stats)
const fetchStats = useDataStore(s => s.fetchStats)

useEffect(() => {
    fetchStats(filters)
}, [filters])
```

## Vantagens do Zustand neste Projeto

1.  **Rendering Otimizado**: Componentes apenas escutam as fatias de estado que realmente utilizam.
2.  **Lógica Centralizada**: O `fetch` não fica espalhado pelos componentes em `useEffect` complexos.
3.  **Persistência (Opcional)**: Fácil de adicionar persistência no local storage se necessário.
4.  **Simplicidade**: Sem necessidade de `Providers` envolvendo a árvore de componentes.

## Como Adicionar uma Nova Consulta

1. Adicione o novo módulo no estado inicial do `useDataStore.ts`.
2. Adicione a função de `fetch` correspondente chamando a API desejada.
3. No componente, consuma o estado e dispare o fetch baseado na mudança dos filtros (`uf`, etc).
