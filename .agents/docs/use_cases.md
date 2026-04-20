# 📖 Guia de Casos de Uso: CNPJ Analítico

Este documento detalha como cada funcionalidade da plataforma deve se comportar para entregar o máximo de valor ao usuário final, dividindo-os por "Aba" ou "Módulo".

---

### 1. 📈 Inteligência de Mercado (Market Intelligence)
**Objetivo:** Auxiliar na tomada de decisão estratégica e expansão.

*   **Caso de Uso 1: Expansão de Franquia**
    *   *Ação:* O usuário seleciona um CNAE (ex: Alimentação) e visualiza o Heatmap.
    *   *Comportamento:* O sistema destaca áreas "vermelhas" (saturação) e sugere cidades com alta população (IBGE) mas baixa concentração de competidores (Oceano Azul).
*   **Caso de Uso 2: Monitoramento de Crise Setorial**
    *   *Ação:* Análise da taxa de natalidade vs mortalidade nos últimos 12 meses.
    *   *Comportamento:* Gráficos de linha mostram se o setor está em retração, permitindo ao investidor pivotar sua estratégia.

---

### 2. 🕵️‍♂️ Prospecção B2B (Lead Gen)
**Objetivo:** Gerar listas de contatos qualificados para vendas.

*   **Caso de Uso 3: Caça-Leads (Novas Empresas)**
    *   *Ação:* Filtro por "Empresas abertas nos últimos 30 dias".
    *   *Comportamento:* Retorna empresas que ainda não possuem fornecedores estabelecidos, ideal para empresas de contabilidade, software e infraestrutura.
*   **Caso de Uso 4: Segmentação por Porte**
    *   *Ação:* Desenhar um polígono no mapa (Draw Tool) e filtrar por Capital Social > R$ 500k.
    *   *Comportamento:* Identifica grandes players em uma zona geográfica específica para abordagem de vendas Enterprise.

---

### 3. 🏭 Consulta CNAE
**Objetivo:** Análise profunda da vocação econômica nacional.

*   **Caso de Uso 5: Pesquisa de Cadeia de Valor**
    *   *Ação:* Busca por um CNAE específico e visualização de CNAEs secundários correlatos.
    *   *Comportamento:* O sistema sugere mercados adjacentes. *Ex: Quem prospecta Indústria Têxtil deve olhar também para Logística de Cargas.*

---

### 4. 🗺️ Municípios
**Objetivo:** Planejamento regional e gestão pública.

*   **Caso de Uso 6: Ranking de Vocação Econômica**
    *   *Ação:* Selecionar uma UF e ordenar cidades pelo PIB Empresarial (Proxy: Soma de Capital Social).
    *   *Comportamento:* Ajuda empresas de logística a definir onde instalar centros de distribuição baseados na força econômica local.

---

### 5. 🛡️ Compliance & Risco
**Objetivo:** Garantir a segurança e regularidade operacional.

*   **Caso de Uso 7: KYC (Know Your Customer) Avançado**
    *   *Ação:* Consulta de um CNPJ para verificar situação cadastral e sócios.
    *   *Comportamento:* O sistema gera um Score de Risco e alerta se o endereço possui concentração atípica de empresas (Coworkings ou "Fábricas de CNPJ").
*   **Caso de Uso 8: Monitoramento de Fornecedores Críticos**
    *   *Ação:* Inserir uma lista de CNPJs para acompanhamento de alteração de sócios ou queda de regularidade (Inaptidão).

---

### Dica de Experiência do Usuário (UI)
*   **Mapa Dark Mode:** Essencial para que os dados neon (insights) se destaquem.
*   **Exportação Inteligente:** Botões de "Exportar Excel" com pré-visualização das colunas selecionadas.
