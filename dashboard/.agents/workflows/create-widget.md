---
description: Como criar um widget de dashboard que consome uma stream RxJS
---

# Fluxo: Criar Widget de Dashboard

Siga estes passos para componentes que exibem dados analíticos.

1. **Instalar Componentes Shadcn (se necessário):**
   ```bash
   npx shadcn@latest add card skeleton
   ```

2. **Componente de Visualização:**
   Crie em `src/components/shared/`.
   - Use o hook `useObservable` para obter o estado atual da stream.
   - Trate o estado `null` ou `undefined` renderizando um `Skeleton`.

3. **Exemplo de Estrutura:**
   ```tsx
   import { useObservable } from '@/hooks/use-observable';
   import { stats$ } from '@/services/stats-service';
   import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
   import { Skeleton } from '@/components/ui/skeleton';

   export function KpiWidget() {
     const data = useObservable(stats$);

     if (!data) return <Skeleton className="h-[120px]" />;

     return (
       <Card>
         <CardHeader><CardTitle>Soma Total</CardTitle></CardHeader>
         <CardContent>{data.total}</CardContent>
       </Card>
     );
   }
   ```
