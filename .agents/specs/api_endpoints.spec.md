# 🌐 Spec: Dashboard API Endpoints

Esta especificação define o contrato entre o Frontend (Next.js) e o Backend (ClickHouse).

## 1. Regras de Resposta
- **Status 200:** Sucesso. Conteúdo em JSON.
- **Status 500:** Erro interno. Deve retornar `{ error: string, timestamp: string }`.
- **Latency:** Todas as rotas de leitura devem responder em sub-segundos (<500ms).

## 2. Endpoints Definidos

### `GET /api/leads`
- **Params:** `uf`, `cnae`, `municipio`, `capital_min`, `capital_max`, `idade_min`, `idade_max`.
- **Output:** Lista de leads enriquecidos.
- **Spec:** Deve consumir `cnpj_gold.v_lead_search`.

### `GET /api/stats`
- **Params:** `uf`.
- **Output:** KPIs de alto nível (Capital total, Natalidade, Sobrevivência).
- **Spec:** Deve consumir unicamente tabelas da camada `cnpj_gold`.

### `POST /api/export`
- **Body:** `{ sql: string, params: object }`.
- **Output:** `{ jobId: string }`.
- **Spec:** Inicia processamento assíncrono via `ExportService`.

### `GET /api/health`
- **Output:** Status de saúde do sistema, latência do DB e frescor das MVs.
- **Spec:** Usada para observabilidade em tempo real.
