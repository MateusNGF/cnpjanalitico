# Especificação Técnica Avançada: API & Dados

Este documento aprofunda os aspectos de modelagem, agregações e melhores práticas para o ecossistema CNPJ Analítico.

## 🔗 Modelagem de Relacionamentos (Star Schema)

Embora o ClickHouse seja um banco colunar, utilizamos uma modelagem em "Estrela" para garantir performance em JOINs de dimensões.

### 1. Relacionamento Central (`estabelecimentos`)
Esta é a nossa tabela "Fato". Dela derivam todas as conexões:
- **`estabelecimentos` ↔ `empresas`**: (1:1 via `cnpj_basico`)
  - *Finalidade:* Obter Razão Social, Capital Social e Porte.
- **`estabelecimentos` ↔ `dim_cnae`**: (N:1 via `cnae_fiscal_principal`)
  - *Finalidade:* Traduzir códigos como `6201500` para "Desenvolvimento de Software".
- **`estabelecimentos` ↔ `dim_municipios`**: (N:1 via `municipio`)
  - *Finalidade:* Converter códigos municipais do IBGE em nomes amigáveis (ex: "São Paulo").
- **`estabelecimentos` ↔ `socios`**: (1:N via `cnpj_basico`) - **[EM BREVE]**
  - *Finalidade:* Mapear o Quadro de Sócios e Administradores (QSA) para análise de grupos econômicos.

---

## 📈 Estratégia de Agregados & Performance

Para que a Dashboard carregue em milissegundos mesmo com milhões de registros, não faremos `COUNT(*)` em tempo real para tudo.

### 1. Materialized Views (O segredo da velocidade)
O ClickHouse permite criar tabelas que se auto-atualizam durante a inserção (ETL).
- **MV_Empresas_Por_UF**: Agrega o total de empresas ativas por estado.
- **MV_Crescimento_Mensal**: Pré-agrupa a natalidade por (mês, cnae, uf).

### 2. Funções de Agregação de Estado (`AggregateFunction`)
Usaremos funções específicas para evitar reprocessamento:
- `uniqCombined()`: Para contar CNPJs únicos de forma hiper-rápida.
- `sumState()`: Para lidar com grandes volumes de Capital Social.

---

## 🛠️ O Que Falta & Roadmap de Dados

| Item | Status | O que precisa ser feito |
| :--- | :---: | :--- |
| **Processamento de Sócios** | ⏳ Pendente | Atualizar `etl.py` para ler arquivos `SOCIO`. |
| **Materialized Views** | ⏳ Pendente | Criar os scripts SQL no ClickHouse para as MVs de dashboard. |
| **Indexação por CNAE** | ✅ OK | Já incluímos no `ORDER BY` da tabela principal. |
| **Normalização de Nomes** | ⚠️ Em progresso | Tratar acentos e maiúsculas nos nomes de cidades vindos do governo. |

---

## 💡 Boas Práticas (Guia do Desenvolvedor)

### No Banco de Dados (ClickHouse):
- **Partitioning**: Particionamos a tabela de estabelecimentos por `uf`. Isso isola as queries de forma que uma busca em `SP` não leia dados de `AC`.
- **LowCardinality**: Sempre usar `LowCardinality(String)` para colunas com poucos valores repetidos (UF, Situação, Natureza Jurídica) para economizar até 90% de espaço.
- **ORDER BY**: A ordem no `MergeTree` deve seguir a ordem de filtro mais comum: `(uf, cnae, situacao)`.

### Na API (BFF):
- **Contract-First**: Definir os tipos TypeScript/Zod antes de codar a rota.
- **Fail-Fast**: Se o filtro de `cnae` vier vazio e a query for pesada, retornar erro 400 antes de bater no banco.
- **Streaming Response**: Para exportação de CSV (Leads), usar stream para não estourar a memória RAM do servidor Node.js.

---

## 🚀 Próxima Etapa sugerida:
Implementar a primeira **Materialized View** para o gráfico de Overview da Dashboard. Isso garantirá que o "Visão Geral" abra instantaneamente.
