---
description: Fluxo de qualidade e deploy para novas funcionalidades
---

# Fluxo: Lançamento de Feature (Deployment)

Siga este checklist antes de marcar uma funcionalidade como "Concluída".

## Passo 1: Verificação Estática
Garanta que o código respeita as regras de estilo e não possui erros latentes.
```bash
npm run lint
```

## Passo 2: Validação de Contratos (Zod)
Certifique-se de que todos os novos schemas Zod em `src/services/` estão exportados e sendo usados para validar as respostas das APIs. Teste com dados reais do ClickHouse para evitar quebras por tipos inesperados.

## Passo 3: Teste de Responsividade
Verifique se os novos widgets renderizam corretamente em `Mobile` e `Desktop`, utilizando os utilitários de container do Tailwind v4.

## Passo 4: Registro de Versão (Changelog)
Documente brevemente a nova métrica ou funcionalidade no `README.md` ou no log de evolução do projeto.

## Passo 5: CI/CD e Deploy
Acione o pipeline de deploy conforme configurado (ex: GitHub Actions ou Vercel). Monitore os primeiros minutos de execução no ambiente de produção para capturar erros de runtime.
