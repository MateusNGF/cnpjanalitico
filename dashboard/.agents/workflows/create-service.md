---
description: Fluxo para criar um novo serviço de dados RxJS com validação Zod
---

# Fluxo: Criar Serviço RxJS

Este workflow deve ser seguido ao criar qualquer nova integração de dados (Stats, Map, Leads, etc).

1. **Definição de Tipos e Schema:**
   Crie o schema `zod` em `src/services/[serviço].ts`.
   ```typescript
   import { z } from 'zod';
   export const DataSchema = z.object({ ... });
   export type DataType = z.infer<typeof DataSchema>;
   ```

2. **Criação do Subject Central:**
   ```typescript
   import { BehaviorSubject } from 'rxjs';
   const dataSubject$ = new BehaviorSubject<DataType | null>(null);
   ```

3. **Lógica de Fetch com Pipe RxJS:**
   Implemente a função de atualização usando `switchMap` e `map` para validação.
   ```typescript
   export const fetchAction = (params) => {
     return from(fetch(`/api/...`)).pipe(
       switchMap(res => res.json()),
       map(json => DataSchema.parse(json)),
       tap(data => dataSubject$.next(data)),
       catchError(err => {
         console.error(err);
         return EMPTY;
       })
     );
   }
   ```

4. **Exposição da Stream:**
   Exporte apenas o observável para o frontend.
   ```typescript
   export const data$ = dataSubject$.asObservable();
   ```
