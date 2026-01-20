# Proposta Detalhada: Plataforma CNPJ Analítico

Esta documentação detalha as vertentes de negócio e a arquitetura técnica para transformar os dados abertos da Receita Federal em um produto de inteligência de mercado de alto valor.

## 1. Visão Geral
O objetivo é criar uma solução que não apenas "baixe dados", mas que forneça **insights acionáveis** para empresários, consultores e equipes de vendas.

---

## 2. Demografia Empresarial: Natalidade e Mortalidade

Para entender o valor dos dados do CNPJ, precisamos olhar para a "vida" das empresas como um ecossistema. Dois conceitos chave são fundamentais:

### Natalidade Empresarial (Abertura)
Refere-se à taxa de abertura de novos CNPJs em um determinado período e região.
- **Importância:** Indica o **aquecimento econômico** e a **confiança do empreendedor** em um setor ou localidade. 
- **Oportunidade de Negócio:** Se a "natalidade" de petshops está subindo em um bairro, fornecedores de ração e pet-grooming têm um novo mercado em expansão para prospectar imediatamente.

### Mortalidade Empresarial (Baixa)
Refere-se à taxa de empresas que encerram suas atividades (Situação Cadastral "Baixada").
- **Importância:** Indica o **risco de mercado** e a **viabilidade econômica**. Uma alta taxa de mortalidade em um setor específico pode sinalizar saturação, falta de demanda ou problemas estruturais na região.
- **Oportunidade de Consultoria:** Um consultor pode usar esse dado para desencorajar um cliente de investir em um setor "cemitério" ou para oferecer serviços de recuperação de empresas em áreas críticas.

---

## 3. Vertentes de Negócio
<truncated 3 lines>

### A. Módulo de Prospecção B2B (Lead Gen)
*   **Funcionalidade:** Filtro avançado por CNAE, UF, Município, Bairro e Capital Social.
*   **Público-alvo:** Empresas que vendem para outras empresas (SaaS, escritórios de contabilidade, fornecedores industriais).
*   **Proposta de Valor:** Redução do custo de aquisição de clientes (CAC) ao focar em leads com perfil ideal (ex: "Buscar todas as indústrias abertas nos últimos 3 meses em Curitiba com capital acima de 100k").

### B. Módulo de Inteligência Competitiva
*   **Funcionalidade:** Mapas de calor de densidade empresarial e análise de fechamentos.
*   **Público-alvo:** Empreendedores que buscam onde abrir novas unidades físicas.
*   **Proposta de Valor:** Identificação de "Oceano Azul" (baixa concorrência) e zonas de risco (alta taxa de mortalidade empresarial no bairro).

### C. Módulo de Compliance e Risco
*   **Funcionalidade:** Monitoramento de mudanças cadastrais e estrutura societária.
*   **Público-alvo:** Departamentos jurídicos e financeiros.
*   **Proposta de Valor:** Prevenção de fraudes e monitoramento de saúde de fornecedores críticos.

---

## 3. Arquitetura Técnica Proposta

### Camada de Ingestão (Go)
*   **Componente:** `downloader`
*   **Tecnologia:** Go com Goroutines.
*   **Vantagem:** Download e extração paralela extremamente veloz, permitindo atualizações mensais rápidas assim que a Receita libera os novos arquivos.

### Camada de Processamento (Python + Polars)
*   **Componente:** `etl`
*   **Tecnologia:** Python 3.10 com biblioteca Polars.
*   **Vantagem:** Polars permite processar arquivos CSV de gigabytes usando `LazyFrames` e quase zero de sobrecarga de memória, carregando os dados limpos diretamente no ClickHouse.

### Camada de Armazenamento (ClickHouse)
*   **Componente:** `cnpj_db`
*   **Tecnologia:** ClickHouse DB.
*   **Vantagem:** Banco de dados colunar otimizado para consultas analíticas. Filtros complexos em 50+ milhões de linhas retornam em milissegundos.

### Camada de Interface (Next.js + Shadcn/ui)
*   **Componente:** `dashboard`
*   **Tecnologia:** Next.js 14, Tailwind CSS, Shadcn/ui.
*   **Vantagem:** UI moderna, rápida e responsiva que "vende" o valor dos dados de forma visual (gráficos, tabelas interativas e mapas).

---

## 4. Estratégia de Monetização (Monetization)
1.  **SaaS por Assinatura:** Acesso completo ao dashboard e filtros.
2.  **API por Uso:** Venda de créditos para enriquecimento de dados e consultas via API.
3.  **Relatórios Customizados:** Consultoria sob demanda com análises profundas de mercados específicos.
