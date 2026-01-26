# Manual Técnico e Estratégico: CNPJ Analítico

Este documento é a "Fonte da Verdade" do projeto, consolidando a visão de negócio, a arquitetura técnica e o planejamento de evolução dos dados.

---

## 1. Visão Estratégica e Valor de Negócio

O **CNPJ Analítico** transforma os Dados Abertos da Receita Federal em uma plataforma de **Inteligência de Mercado** e **Geração de Leads Qualificados**.

### 1.1. Principais Casos de Uso
*   **Prospecção B2B:** Identificação de novas empresas com perfil ideal (CNAE, Capital Social, Localização).
*   **Análise de Demografia Empresarial:** Monitoramento de taxas de **Natalidade** (aberturas) e **Mortalidade** (fechamentos) para identificar setores aquecidos ou saturados.
*   **Inteligência Competitiva:** Mapas de calor (Heatmaps) de densidade empresarial para expansão física.
*   **Compliance e Risco:** Verificação de estrutura societária e saúde tributária (Simples Nacional/MEI).

---

## 2. Arquitetura de Dados

O ecossistema utiliza tecnologias de processamento massivo para lidar com a base de ~60 milhões de registros.

### 2.1. Tecnologias
*   **Ingestão:** `downloader` (Go) para download e extração paralela.
*   **Processamento:** `etl` (Python + Polars) com processamento via `LazyFrames` para baixo consumo de memória.
*   **Armazenamento:** `ClickHouse` (Banco colunar) para consultas analíticas instantâneas.
*   **Frontend:** `dashboard` (Next.js 14 + Shadcn/ui) para visualização e filtros.

### 2.2. Modelagem ClickHouse (Star Schema)
Para máxima performance, as tabelas são estruturadas em um modelo estrela, priorizando o motor `MergeTree` e indexação por UF.

*   **Tabela Fato (`estabelecimentos`):** Contém os dados de cada unidade, particionada por `UF`.
*   **Dimensões:**
    *   `empresas`: Relacionamento 1:1 para Razão Social e Capital Social.
    *   `dim_cnae`: Descrições das atividades econômicas.
    *   `dim_municipios`: Mapeamento de códigos IBGE.
    *   `dim_naturezas_juridicas` **[NOVO]**: Classificação jurídica das entidades.
    *   `dim_motivos` **[NOVO]**: Motivação para baixas e situações cadastrais.
    *   `simples` **[NOVO]**: Histórico de enquadramento Simples Nacional e MEI.
    *   `socios`: Quadro de Sócios e Administradores (QSA) para análise de redes.

---

## 3. Estratégia de Performance (Analytics)

Para garantir que a Dashboard carregue em milissegundos:

1.  **Materialized Views (MV):** Pré-agregamos dados durante a ingestão (ex: `mv_resumo_uf`, `mv_cnae_ranking`).
2.  **LowCardinality:** Aplicado em colunas com baixa variabilidade (UF, Situação, Natureza Jurídica) para reduzir uso de disco em até 90%.
3.  **Particionamento Geográfico:** Consultas filtradas por UF isolam fisicamente os arquivos de dados, acelerando a resposta.
4.  **assumeNotNull:** Utilizado em agregações temporais para evitar penalidades de processamento em colunas nulas.

---

## 4. Hierarquia e Performance de Filtros (Obrigatório)

Para tirar proveito máximo do ClickHouse, os filtros da interface seguem a hierarquia do índice definido no `ORDER BY` e `PARTITION BY`. Ignorar esta ordem pode resultar em consultas lentas (Full Scans).

### 4.1. Hierarquia Técnica (Priority Stack)
1.  **UF (Estado):** **Nível Máximo.** Particionamento físico. Ativa o "Partition Pruning" (leitura de apenas 1 pasta no disco).
2.  **CNAE (Atividade):** **Nível Alto.** Primeiro nível do índice primário. Salto direto para blocos de dados específicos dentro da partição.
3.  **Situação Cadastral:** **Nível Médio.** Segundo nível do índice. Filtra rapidamente Ativas/Baixadas sem varredura completa.
4.  **Município:** **Nível Baixo.** Terceiro nível do índice. Refinamento de localização.

> [!IMPORTANT]
> A interface foi otimizada para guiar o usuário nesta ordem. O campo **UF** possui um indicador de alta performance para incentivar seu uso.

### 4.2. Filtros de Valor de Negócio
*   **Capital Social (Faixa):** Útil para segmentação de porte (requer JOIN).
*   **Data de Início:** Otimizada via *Materialized Views* para tendências temporais.

---

## 5. Roadmap de Enriquecimento e Futuro

Para agregar ainda mais valor aos clientes, o próximo passo é cruzar os dados da RFB com outras fontes:

### 4.1. Dados Públicos (Gov/IBGE)
*   **IBGE (PIB/População):** Cruzar empresas por cidade com o poder de compra da região.
*   **Novo CAGED:** Inserir indicadores de saldo de empregos por setor para mostrar onde há contratação real.
*   **Gastos Públicos:** Identificar empresas com contratos ativos com o governo (B2G).

### 4.2. Dados de Mercado/Digitais
*   **Presença Digital:** Enriquecimento com URLs de sites, Instagram, LinkedIn e avaliações do Google Maps.
*   **Geolocalização Precisa:** Utilizar o CNEFE (IBGE) para coordenadas Lat/Long exatas e criação de mapas de calor ultra-precisos.

---

## 5. Próximos Passos Técnicos
1.  **Finalização do ETL de Sócios:** Integrar completamente a tabela `socios` para filtros de beneficiários finais.
2.  **Dashboard de Leads Avançado:** Implementar no frontend os novos filtros baseados nas tabelas `simples` e `naturezas_juridicas`.
3.  **Sistema de Exportação:** Implementar streaming de PDF/CSV para listas de prospecção de alta volumetria.

---
*Este documento foi consolidado em 20/01/2026, unindo api_spec, levantamento_dados e proposta_valor.*
