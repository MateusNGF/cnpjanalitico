# 🧠 CNPJ Analítico: Manifesto de Desenvolvimento (v2.0)

Este documento serve como a "Memória Central" para qualquer agente de IA ou desenvolvedor que atue neste projeto. Ele descreve as decisões arquiteturais fundamentais e os padrões que **devem** ser seguidos para manter a integridade enterprise do sistema.

## 🏛️ 1. Arquitetura de Dados (Medallion)

O ClickHouse está dividido em três camadas lógicas. **Nunca realize cruzamentos complexos na camada Gold; use a Silver para isso.**

- **`cnpj_bronze` (Camada Raw):**
    - **Objetivo:** Ingestão pura ("As-Is").
    - **Padrão:** Colunas do tipo `String`, motor `Log()`.
    - **Regra:** Sem validação ou casting. Apenas auditoria.
- **`cnpj_silver` (Camada Enriched):**
    - **Objetivo:** Source of Truth.
    - **Padrão:** Tipos nativos (`Date32`, `UInt8`), motor `MergeTree`.
    - **Cnas & Municípios:** Devem usar Dicionários (`dictGet`) para evitar Joins pesados.
    - **Codecs:** Colunas de texto de alta cardinalidade devem usar `ZSTD(3)`.
- **`cnpj_gold` (Camada Consumption):**
    - **Objetivo:** Analytics e UI.
    - **Padrão:** Materialized Views (`SummingMergeTree`) para agregações.
    - **Performance:** Consultas do Dashboard devem tocar apenas nesta camada.

## ⚙️ 2. Pipeline ETL (Python & Polars)

O pipeline em `etl/populate.py` é o motor de transformação.
- **Validação de Esquema:** Sempre valide a contagem de colunas antes de processar.
- **Tipagem Estrita:** Use o Polars para forçar esquemas e tratar valores nulos com a data sentinela `1900-01-01`.
- **Chunking:** Processar arquivos grandes em lotes para manter o consumo de memória estável.
- **Logging:** Use logs estruturados (JSON) para facilitar a observabilidade.

## 📡 3. Ingestão & Download (Go)

O downloader em `downloader/main.go` é focado em eficiência.
- **Incrementalismo:** Verifique o header `Last-Modified` via `HEAD` request e use o `manifest.json`.
- **Resiliência:** Use ficheiros temporários (`.tmp`) durante a extração de ZIPs.
- **Paralelismo:** Mantenha o controle de workers para não saturar a IO do servidor.

## 🎨 4. Frontend & Dashboards (Next.js)

Seguimos um padrão de design "Apple-inspired" (Premium, Minimalista).
- **Feature-Based Architecture:** Mantenha as pastas divididas por domínio (`features/analytics`, `features/prospecting`).
- **Estado Global:** Use Zustand com middleware de persistência para filtros dinâmicos.
- **UX:**
    - **Skeletons:** Sempre forneça estados de carregamento de alta fidelidade.
    - **Exports:** Devem ser assíncronos (`ExportService`). Nunca trave a UI para gerar CSVs.
- **API Routes:** Use rotas dinâmicas e garanta que erros do ClickHouse sejam capturados e retornados de forma amigável.

## 📑 5. Padrões de Código e Convenções

- **ClickHouse SQL:** Sempre use `IF NOT EXISTS` em DDLs.
- **Type Safety:** TypeScript é obrigatório no frontend. Não use `any`.
- **Documentação:** Qualquer mudança no schema deve ser refletida no `docs/enterprise_elevation_plan.md`.

---
*Este manifesto deve ser atualizado sempre que um novo pilar técnico for consolidado.*
