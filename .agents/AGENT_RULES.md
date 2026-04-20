# 🤖 Regras do Agente (SDD-Driven)

Estas regras governam o comportamento de qualquer IA ou desenvolvedor atuando neste repositório. O descumprimento destas regras é considerado falha na entrega enterprise.

## 1. O Ciclo de Desenvolvimento (MANDATÓRIO)
Antes de escrever qualquer linha de código, o agente DEVE:
1.  **Ler as Specs:** Consultar os ficheiros em `.agents/specs/`.
2.  **Validar Alinhamento:** Confirmar se a tarefa solicitada respeita o Manifesto de Desenvolvimento em `.agents/DEVELOPMENT_MANIFEST.md`.
3.  **Atualizar a Spec:** Se a tarefa envolve mudança em API ou Schema, a especificação correspondente deve ser atualizada **antes** do código.

## 2. Regras de Dados (ClickHouse)
- **Não ao Nullable:** Proibido usar `Nullable` em colunas de grande volume. Use valores sentinela.
- **Camada Gold é Sagrada:** Nunca execute queries de agregação `SELECT count()...` diretamente na Silver a partir do Frontend. Use as MVs da Gold.
- **DDL Seguro:** Sempre use `IF NOT EXISTS` e nunca apague tabelas (DROP) sem confirmação explícita do utilizador e backup de manifest.

## 3. Regras de Frontend (Next.js/React)
- **Aparência é Funcionalidade:** Se UI for simples demais ou parecer "padrão", a tarefa falhou. Use glassmorphism, gradientes suaves e tipografia moderna (Inter/Outfit).
- **Sem Any:** O uso de `any` em TypeScript é estritamente proibido. Tipagem deve ser derivada das Specs de API.
- **Performance Percebida:** Carregamentos com mais de 300ms devem ter Skeletons. Nunca use spinners genéricos.

## 4. Regras de ETL (Python/Go)
- **Memória Primeiro:** Nunca carregue arquivos de CNPJ inteiros em memória no Python. Use as APIs Lazy do Polars (`scan_csv`).
- **Auditabilidade:** Todo erro de ingestão deve ser logado em formato JSON e não deve travar o pipeline para os outros arquivos.

## 5. Documentação Ativa
- Ao finalizar qualquer alteração, o ficheiro `docs/enterprise_elevation_plan.md` deve ser atualizado com o status da tarefa.
