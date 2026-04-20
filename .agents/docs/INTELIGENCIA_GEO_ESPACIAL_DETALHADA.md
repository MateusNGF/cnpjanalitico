# Detalhamento Técnico: Inteligência Geo-Espacial (Drill-Down)

Este documento aprofunda a implementação da **Fase 2** do roadmap, focada em transformar a análise macro (Estados/Municípios) em inteligência de vizinhança (Bairros/CEP).

---

## 🏗️ 1. Arquitetura de Dados

A base desta funcionalidade repousa sobre a capacidade do ClickHouse de agregar coordenadas e prefixos espaciais em milissegundos.

### 1.1 Tabelas e Índices
Utilizaremos a coluna `cep` da tabela `estabelecimentos` como o elo de ligação mais granular antes da geolocalização exata.

- **MV: Densidade por Prefixo de CEP (5 dígitos)**
    ```sql
    CREATE MATERIALIZED VIEW mv_densidade_geografica
    ENGINE = SummingMergeTree()
    ORDER BY (uf, municipio, cep_prefixo, cnae_fiscal_principal) AS
    SELECT 
        uf,
        municipio,
        substring(cep, 1, 5) as cep_prefixo,
        cnae_fiscal_principal,
        count() as total
    FROM estabelecimentos
    GROUP BY uf, municipio, cep_prefixo, cnae_fiscal_principal;
    ```
- **Índice Espacial:** Uso de `Point` columns e funções como `greatCircleDistance` para permitir filtros de "Empresas em um raio de X km".

---

## 🗺️ 2. Navegação em Camadas (Drill-Down)

A experiência do usuário será dividida em três níveis de zoom, cada um com sua fonte de dados otimizada:

### Nível 1: Visão Estadual (Atual)
- **Granularidade:** Município.
- **Visualização:** Mapa Coroplético (Cores por densidade).
- **Fonte:** `mv_resumo_municipio`.

### Nível 2: Visão Municipal (Drill-Down)
- **Ativação:** Clique em um município ou Zoom > 10.
- **Granularidade:** Bairros ou Prefixos de CEP.
- **Visualização:** Polígonos de Bairros coloridos ou Grids Hexagonais (H3).
- **Fonte:** `mv_ranking_bairros` ou API Geográfica Baseada em CEP.
- **Desafio Técnico:** Obtenção de malhas GeoJSON de bairros. *Solução proposta:* Uso da API do OSM (Nominatim) ou bases estáticas locais para grandes capitais.

### Nível 3: Visão de Rua (Micro-Targeting)
- **Ativação:** Zoom > 14.
- **Visualização:** Marcadores individuais (Pins).
- **Fonte:** `v_lead_completo` (filtrado pela Bounding Box atual do mapa).
- **Otimização:** Uso de `Leaflet.markercluster` ou `Supercluster` para agrupar pins e evitar perda de performance no DOM.

---

## 🔍 3. Casos de Uso e Estratégias de Negócio

### 3.1 Geomarketing e Expansão
- **Análise de Saturação Local:** O usuário pode ver que embora Belo Horizonte esteja saturado de farmácias, o bairro "Castelo" possui uma densidade muito menor que a média da cidade.
- **Identificação de Polos:** Visualizar onde se concentram fornecedores (Ex: Bairro do Brás em SP para confecções).

### 3.2 Logística e Delivery
- Focando no prefixo de CEP (5 dígitos), empresas de logística podem calcular a densidade de potenciais clientes B2B por rota de entrega.

---

## 🛠️ 4. Próximos Passos de Desenvolvimento

1.  **Mock de Malha de Bairros:** Criar uma estrutura de dados de exemplo para uma capital (ex: São Paulo ou BH) para validar o componente visual.
2.  **API de Bounding Box:** Criar um endpoint `/api/map/bounds` que recebe `north, south, east, west` e retorna os pins individuais para o nível de rua.
3.  **H3 Indexing (Opcional):** Avaliar o uso de índices H3 do Uber para gerar grades de calor uniformes em áreas onde não temos GeoJSON de bairros.

---

> [!NOTE]
> Esta funcionalidade exige que o componente `MapaMalha.tsx` suporte a troca dinâmica de camadas GeoJSON sem recarregar todo o estado da página.
