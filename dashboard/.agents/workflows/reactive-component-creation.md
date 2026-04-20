---
description: Como criar um componente visual que reage a streams de dados RxJS
---

# Fluxo: Criação de Componente Reativo

Siga este fluxo para integrar componentes visuais com o motor de dados RxJS.

## Passo 1: Componente Visual (Shadcn)
Instale ou crie o componente base utilizando as diretrizes do Shadcn UI.
```bash
npx shadcn@latest add card chart --path src/components/ui
```

## Passo 2: Definição da Stream de Dados
Identifique ou crie o `Observable` que proverá os dados. Se for um dado novo, siga o `create-service.md`.
```typescript
// Exemplo em src/services/leads.ts
export const leads$ = leadsSubject$.asObservable();
```

## Passo 3: Consumo via Hook (Reatividade)
Utilize o hook `useObservable` dentro do componente React para assinar o fluxo.
```tsx
export function MyReactiveComponent() {
  const data = useObservable(leads$);
  
  if (!data) return <Skeleton />;
  
  return <DataDisplay value={data} />;
}
```

## Passo 4: Otimização
Garanta que o componente só renderize novamente quando os dados específicos dele mudarem (o RxJS já ajuda nisso, mas utilize `React.memo` se for um componente de lista pesado).
