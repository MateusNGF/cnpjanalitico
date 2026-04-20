# Templates de Resposta (UI Mapping)

Estes templates garantem que a saída do agente seja compatível com os componentes Shadcn e Shared do frontend.

## 1. Template: KpiCard
Use este formato para exibir métricas rápidas no topo do dashboard.
```json
{
  "type": "kpi",
  "title": "[Título Curto]",
  "value": "[Valor Formatado BRL/Qtd]",
  "trend": "up | down | neutral",
  "percentage": [number],
  "description": "[Texto auxiliar opcional]"
}
```

## 2. Template: Alert (Insights Críticos)
Use o padrão Shadcn `Alert` para sinalizar riscos ou anomalias importantes.
```markdown
> [!CAUTION]
> **[Título do Alerta]**
> [Descrição do insight crítico, ex: "Detectada alta taxa de mortalidade (25%) no setor têxtil de Campinas nos últimos 6 meses."]
```
*   **Variantes:** Use `[!IMPORTANT]` para oportunidades e `[!CAUTION]` para riscos.

## 3. Template: LeadTable (CompaniesTable)
Formato de dados que o componente `CompaniesTable` (baseado em TanStack Table) espera.
```json
{
  "type": "table",
  "name": "LeadTable",
  "columns": [
    { "key": "cnpj", "label": "CNPJ" },
    { "key": "razao_social", "label": "Razão Social" },
    { "key": "capital_social", "label": "Capital Social" },
    { "key": "data_abertura", "label": "Abertura" }
  ],
  "rows": [
    {
      "cnpj": "00.000.000/0001-91",
      "razao_social": "EMPRESA EXEMPLO LTDA",
      "capital_social": "R$ 100.000,00",
      "data_abertura": "01/01/2020"
    }
  ]
}
```

## 4. Template: Charts (Recharts)
Estrutura para gráficos de barras ou linhas.
```json
{
  "type": "chart",
  "engine": "recharts",
  "variant": "bar | line | area",
  "data": [
    { "label": "Jan", "value": 400 },
    { "label": "Fev", "value": 300 }
  ]
}
```
