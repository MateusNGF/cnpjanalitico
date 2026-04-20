# Dicionário de Dados e Domínio - CNPJ Analítico

Guia de tradução entre códigos da Receita Federal (RFB), ETL e regras de negócio.

## 1. Situação Cadastral (`cod_situacao`)
O agente deve mapear os códigos numéricos para estados legíveis:
- **2:** ATIVA (Filtro padrão para análise de mercado)
- **8:** BAIXADA (Empresas encerradas)
- **4:** INAPTA (Possui pendências fiscais grave)
- **3:** SUSPENSA
- **1:** NULA

## 2. Geografia e Localização
- **UF:** Sempre use siglas de 2 dígitos em maiúsculas (ex: `'SP'`, `'MG'`, `'RJ'`).
- **municipio_id:** Código oficial do Governo (TOM). Não confundir com IDs internos sequenciais.
- **Hierarquia:** UF > Município > Bairro > Logradouro.

## 3. Datas e Temporalidade
- **data_abertura:** Data de nascimento da empresa (Campo: `Date`). Use para cálculos de sobrevivência e natalidade.
- **data_situacao_cadastral:** Data da última mudança de status (abertura ou encerramento).
- **processed_at / etl_load_date:** Data técnica de processamento. **Nunca** use para estatísticas de mercado, apenas para checagem de "frescor" dos dados.

## 4. Financeiro e Porter
- **capital_social:** Armazenado como `Float64`. 
  - **Interface:** Formatar sempre como Moeda Brasileira (`BRL`, ex: `R$ 10.000,00`).
  - **Cuidado:** Valores `0.00` podem significar dado não informado em empresas muito antigas.
- **Porte da Empresa:**
  - **1:** ME (Micro Empresa)
  - **3:** EPP (Empresa de Pequeno Porte)
  - **5:** DEMAIS (Grandes empresas, S.A., etc.)

## 5. Atividade Econômica (CNAE)
- **CNAE Fiscal:** Código de 7 dígitos.
- **CNAE Primário:** Atividade principal.
- **CNAE Secundário:** Atividades acessórias (armazenados em Array no ClickHouse).
