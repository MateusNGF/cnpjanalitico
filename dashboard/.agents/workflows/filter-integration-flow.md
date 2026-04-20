---
description: Como adicionar um novo filtro orquestrado no dashboard
---

# Fluxo: Integração de Novos Filtros

Este fluxo garante que a adição de um filtro (ex: Filtro de Data) dispare automaticamente a atualização de todos os componentes dependentes.

## Passo 1: Estado no Store (Zustand)
Adicione o novo campo no `use-filter-store.ts` para controle de UI (input).
```typescript
{
  filters: {
    ...,
    newDataRange: null
  },
  setNewDataRange: (val) => set({ filters: { ...get().filters, newDataRange: val } })
}
```

## Passo 2: Emissão para o Stream (`filter$`)
No serviço de filtros, garanta que a stream `filter$` emita o novo estado sempre que o store do Zustand for atualizado.
- **Dica:** Utilize um `tap` ou chame `.next()` no `filter$` dentro da action do Zustand para gatilhar os `switchMap` das APIs.

## Passo 3: Query Params (buildQueryParams)
Atualize a função utilitária `buildQueryParams` (geralmente em `src/lib/api.ts`) para incluir o novo parâmetro.
```typescript
if (filters.newDataRange) {
  params.append('range', filters.newDataRange);
}
```

## Passo 4: Verificação de Orquestração
Verifique se as chamadas de API disparadas pelos serviços em `src/services/` estão reagindo ao novo parâmetro sem a necessidade de múltiplos `useEffect` manuais.
