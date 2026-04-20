---
description: Guia de recuperação de desastres e manutenção do ambiente Docker
---

# Fluxo: Recuperação de Infraestrutura

Use este guia se o dashboard não conseguir se conectar ao banco ou se o ambiente estiver instável.

## Passo 1: Status dos Containers
Verifique se todos os serviços (ClickHouse, API, Dashboard) estão ativos no Docker.
```bash
docker-compose ps
```
- Se o ClickHouse estiver em `Exit 137`, pode ser falta de memória RAM no host.

## Passo 2: Verificação de Corrupção de Partes
Se o ClickHouse retornar erro de "Broken part", tente otimizar a tabela ou re-indexar partes específicas.
```sql
SYSTEM CHECK TABLE empresas;
REOPTIMIZE TABLE empresas FINAL;
```

## Passo 3: Limpeza de Cache de Build
Se o Dashboard Next.js estiver exibindo bugs visuais ou de rota, limpe o cache e reinicie.
```bash
rm -rf .next
docker-compose restart dashboard
```

## Passo 4: Verificação de Logs do Engine
Se um container estiver reiniciando infinitamente, verifique o log de erro:
```bash
docker-compose logs --tail=100 clickhouse
```
