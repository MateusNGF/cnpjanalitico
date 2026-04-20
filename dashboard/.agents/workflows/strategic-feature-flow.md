---
description: Fluxo de desenvolvimento de funcionalidades core focadas em inteligência de mercado
---

# Fluxo de Desenvolvimento Estratégico

Este workflow deve ser seguido ao criar qualquer uma das 5 features core (Prospecção, Demografia, Geo-Inteligência, Compliance, Índices Proprietários).

## 1. Mapeamento do Funil de Dados
Antes de codar, valide se a funcionalidade respeita a hierarquia de índices para performance:
- [ ] O filtro de UF é o ponto de entrada? (Obrigatório para ~60M registros)
- [ ] A query ClickHouse utiliza os índices primários (CNAE, Situacao)?
- [ ] O drill-down geográfico prevê 3 níveis (Estado -> Município -> Bairro/CEP)?

## 2. Definição do Insight (A Entrega de Valor)
Responda: "Qual dor do empresário esta feature resolve?"
- [ ] **Prospecção:** Identifica leads qualificados com Capital Social e Maturidade?
- [ ] **Demografia:** Mostra o balanço real de Saturação (Aberturas - Fechamentos)?
- [ ] **GEO:** Facilita a escolha de um ponto físico (Geomarketing)?
- [ ] **Compliance:** Reduz o risco de parceria/crédito?

## 3. Implementação da Interface Pragmática
Siga o checklist de `ux-ui-rules.md`:
- [ ] Utilizou padrões puros do Shadcn UI?
- [ ] Implementou **Lazy Loading** (`next/dynamic`) para componentes pesados?
- [ ] Configurou `Suspense` com o `Skeleton` correto?
- [ ] O componente é "Zero Reload" (RxJS Powered)?
- [ ] A visualização de dados é clara e direta (sem ruído visual ou excesso de animações)?


## 4. Orquestração de Dados (RxJS)
Siga o padrão técnico:
1.  **Service:** Crie o `Observable` no `src/services/` que encapsula a lógica de negócio.
2.  **Schema:** Valide o retorno do ClickHouse com `zod`.
3.  **Component:** Assine o stream usando o hook `useObservable`.
4.  **Feedback:** Garanta que o estado de `loading` utilize `Skeletons` padrão do Shadcn.

## 5. Validação da Eficiência Analítica
- [ ] A feature entrega a resposta de forma mais rápida e simples que a concorrência?
- [ ] A interface permite que o usuário tome uma decisão em menos de 3 cliques?

