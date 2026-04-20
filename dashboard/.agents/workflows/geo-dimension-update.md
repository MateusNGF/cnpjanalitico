---
description: Workflow para atualizar coordenadas e IDs de municípios
---

# Atualização Geográfica (Geo-Dimension)

Este fluxo garante que o mapa Leaflet tenha as coordenadas (Lat/Lon) e nomes de municípios atualizados.

## Passo 1: Enriquecimento via dimensoes_geo.py
Execute o script para cruzar os IDs dos municípios com a base de coordenadas do IBGE/CNEFE.
```bash
python etl/dimensoes_geo.py --update-all
```

## Passo 2: Atualização de Dicionários no ClickHouse
Após a carga das tabelas de dimensão, force a atualização dos Dictionaries para que o `dictGet` retorne os nomes corretos.
```sql
SYSTEM RELOAD DICTIONARY analytics.cidades_dict;
SYSTEM RELOAD DICTIONARY analytics.cnaes_dict;
```

## Passo 3: Validação de Coordenadas
Verifique se existem registros com latitude/longitude zeradas que podem quebrar a plotagem no mapa.
```sql
SELECT count() 
FROM empresas_geo 
WHERE latitude = 0 OR longitude = 0;
```
