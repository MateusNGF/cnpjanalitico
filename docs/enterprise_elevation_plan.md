# 🚀 Plano de Elevação Enterprise: CNPJ Analítico

Este documento detalha a estratégia para transformar o MVP em uma solução robusta, resiliente e de alto desempenho.

## 🏗️ Pillar 1: Data Engineering & Incremental ETL

### 1.1. Incremental Downloader (`downloader/main.go`)
- [x] Implement `HEAD` requests before `GET` to check `Last-Modified`.
- [x] Save download metadata to skip unchanged files (`manifest.json`).
- [x] Optimize ZIP extraction with atomic writes (`.tmp` -> rename) to prevent partial data.

### 1.2. Schema Validation (`etl/populate.py`)
- [x] Add pre-run validation of CSV columns using Polars schema inference.
- [x] Implement strict type checking and manual casting before insertion.

### 1.3. Medallion Architecture (ClickHouse)
- [x] Separate data into `cnpj_bronze` (raw), `cnpj_silver` (cleaned), and `cnpj_gold` (analytics views).
- [ ] Implement incremental materialization between Silver and Gold.

## 🚀 Pillar 2: ClickHouse Optimization

### 2.1. Projections
- [x] Add `PROJECTION` to `estabelecimentos` for `(uf, cnae_fiscal_principal)`.
- [x] Add `PROJECTION` to `estabelecimentos` for `(municipio, cnae_fiscal_principal)`.

### 2.2. Compression & Storage
- [x] Update `ZSTD(1)` to `ZSTD(3)` for high-cardinality strings like `razao_social`.
- [x] Move critical dictionaries to `Memory` persistent cache settings (`LIFETIME(0)`).

## 🧠 Pillar 3: Business Intelligence & Lead Scoring

### 3.1. Lead Scoring Algorithm
- [x] Implement scoring logic in `v_lead_completo`.
- [x] Factors: Capital Social, Age (Recency), Sector Stability.

### 3.2. Geospatial Search
- [x] Enhance `dim_municipios` and `estabelecimentos` via `v_lead_completo` with `Point` coordinates for radius-based queries.

## 🎨 Pillar 4: UX & Next.js Improvements

### 4.1. Asynchronous Export
- [x] Background job system implemented (`ExportService`).
- [x] Notification/Download Center in `DashboardHeader`.

### 4.2. Filter Persistence
- [x] Persistent named filter configurations using `zustand/persist`.

### 4.3. Skeleton Loading
- [x] High-fidelity skeleton states for KPI cards and dashboard metrics.

## 🔍 Pillar 5: Observability & DevOps

### 5.1. Structured Logging
- [x] JSON-based logging in `populate.py` for machine readability.

### 5.2. Health Monitoring
- [x] `/api/health` endpoint for real-time monitoring of ClickHouse connectivity and MV freshness.
