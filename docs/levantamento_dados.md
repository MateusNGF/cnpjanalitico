# Levantamento Analítico de Dados: CNPJ Open Data

Este documento detalha os dados disponíveis, as limitações e o potencial analítico da base de Dados Abertos de CNPJs da Receita Federal do Brasil (RFB).

## 1. Dados Disponíveis (Incluso no ETL)

A base é composta por grupos de arquivos CSV (layout RFB) que são processados e armazenados no ClickHouse.

### 1.1. Empresas (EMPRE)
Informações cadastrais estruturais da empresa (nível raiz).
- **Campos Principais:** CNPJ Básico, Razão Social, Natureza Jurídica, Capital Social, Porte da Empresa.
- **Utilidade:** Análise de concentração de capital, segmentação por porte (ME, EPP, Demais) e agrupamento por grupo econômico.

### 1.2. Estabelecimentos (ESTABELE)
Dados locais de cada unidade (matriz e filiais).
- **Campos Principais:** CNPJ Completo, Nome Fantasia, Situação Cadastral (Ativa, Baixada, etc), Data de Início, Endereço (UF, Município, Bairro, CEP), CNAE Principal e Secundário, Contato (Telefone, E-mail).
- **Utilidade:** Geoprocessamento, análise de "saúde" setorial (aberturas vs. baixas), identificação de pólos industriais/comerciais.

### 1.3. Sócios (SOCIO)
Composição societária das empresas.
- **Campos Principais:** CNPJ Básico, Nome do Sócio, Identificador de Sócio (Pessoa Física, Jurídica ou Estrangeiro), Qualificação, Data de Entrada, Faixa Etária.
- **Utilidade:** Mapeamento de redes de influência, análise demográfica de empreendedores e identificação de beneficiários finais.

### 1.4. Dimensões e Tabelas Auxiliares
- **CNAE:** Códigos e descrições das atividades econômicas.
- **Municípios:** Mapeamento de códigos IBGE/RFB para nomes de cidades.
- **Natureza Jurídica:** Tipos societários (LTDA, SA, MEI, etc).

---

## 2. Dados Não Disponíveis (Limitações do Open Data)

É crucial entender o que **não consta** na base pública para alinhar as expectativas de análise:

1.  **Dados Fiscais/Faturamento:** Não há dados de faturamento real, lucro ou impostos pagos. O "Capital Social" é o único dado financeiro disponível, mas representa o valor declarado na constituição/alteração, não o fluxo de caixa.
2.  **Quadro de Funcionários:** A base não informa o número de empregados.
3.  **Documentos Ofuscados:**
    *   **CPF de Sócios:** Apenas os 3 dígitos centrais são exibidos (ex: ***.123.***-**).
    *   **Sócios de MEI:** O CPF do titular do MEI é omitido por questões de LGPD.
4.  **Histórico de Alterações:** A base é um "snapshot" (foto do momento). Não é possível ver quem eram os sócios anteriores ou endereços passados, a menos que se armazene backups mensais para comparação temporal.
5.  **Simples Nacional (Específico):** A indicação de opção pelo Simples é um arquivo separado e muitas vezes defasado em relação ao status cadastral.

---

## 3. Potencial de Análise (Analytics)

Mesmo com as limitações, a base permite visões poderosas:

*   **Taxa de Natalidade/Mortalidade:** Quantas empresas abrem vs. fecham por mês em cada setor (CNAE) e região.
*   **Análise de Sobrevivência:** Quanto tempo, em média, uma empresa de um determinado setor leva para fechar após a abertura.
*   **Densidade Econômica:** Identificação de bairros ou cidades com alta saturação de serviços específicos.
*   **Segmentação de Mercado:** Criação de listas de leads qualificadas com base em CNAE, porte e localização.

---

## 4. Boas Práticas e Referências

### Técnicas
- **ClickHouse Optimization:** Utilizar `LowCardinality` em colunas como UF e Situação Cadastral para reduzir o consumo de disco e acelerar queries.
- **Particionamento:** Tabela de estabelecimentos deve ser particionada por UF ou Mês/Ano de início para otimizar filtros geográficos/temporais.
- **Encoding:** Atenção ao encoding `Latin-1` ou `UTF-8` com caracteres especiais ao processar os arquivos da RFB.

### Referências
- [Página Oficial de Dados Abertos - Receita Federal](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-dos-cnpj)
- [Concla (IBGE) - Estrutura CNAE](https://concla.ibge.gov.br/)

---
*Documento gerado automaticamente pelo assistente de IA em 20/01/2026.*
