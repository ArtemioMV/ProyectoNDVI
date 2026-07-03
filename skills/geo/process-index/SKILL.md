---
name: process-index
description: Implementa el calculo de un indice satelital (NDVI, NDRE, NDMI, SAVI, EVI...) en services/geo-worker de forma asincrona, guardando raster/previews en MinIO y reportando metadatos y estadisticas a la API por endpoint interno firmado. Usa esta skill SIEMPRE que se pida procesar un indice espectral, calcular NDVI u otro indice, implementar un job de procesamiento satelital, o cuando digan 'procesar indice', 'calcular NDVI', 'process index', 'satellite job', 'indice espectral'. No la uses dentro del request HTTP de la API.
---

# Procesar indice satelital (geo-worker)

## Cuando usar
Calcular un indice espectral sobre una escena para una parcela/area. Corre en el worker, nunca dentro del request HTTP.

## Documentacion obligatoria (leer antes)
- `docs/02-domain/satellite-processing.md`
- `docs/01-architecture/data-flow.md`
- `docs/01-architecture/frontend-backend-boundaries.md`
- `docs/01-architecture/decisions/ADR-004-use-python-worker.md`

## Flujo (contrato del sistema)
1. La API valida sesion/permiso/alcance y publica el job en Redis.
2. El worker consume el job, recorta el raster a la parcela (ver **clip-raster**) y calcula el indice.
3. Calcula estadisticas zonales (ver **zonal-statistics**).
4. Guarda raster/previews en MinIO/S3.
5. Reporta resultado a la API por el endpoint interno FIRMADO (`INTERNAL_WORKER_CALLBACK_SECRET`).
6. La API persiste metadatos/estadisticas/auditoria en PostgreSQL.

## Ubicacion
```
services/geo-worker/src/
  jobs/          # orquestacion del job
  indices/       # formulas por indice (ndvi, ndre, ndmi, savi, evi)
  processing/    # recorte, remuestreo
  providers/     # abstraccion de proveedor de escenas
  storage/       # MinIO/S3
  clients/       # callback firmado a la API
  schemas/       # entrada/salida del job
  observability/
```

## Reglas
- Procesar FUERA del request HTTP.
- Arquitectura no acoplada solo a NDVI: la formula del indice es intercambiable.
- Objetos grandes -> MinIO/S3; metadatos/estadisticas -> PostgreSQL via API.
- Errores recuperables con contexto (job_id, organizacion, parcela, escena).
- Preservar contexto de organizacion, parcela, job y auditoria de punta a punta.
- Idempotencia: reprocesar el mismo job no debe duplicar resultados (ver **review-geo-job**).

## Checklist antes de terminar
- [ ] Indice desacoplado (intercambiable) y con test de formula.
- [ ] Raster/preview en MinIO; stats/metadatos reportados a la API.
- [ ] Callback firmado con el secreto interno.
- [ ] Errores recuperables con contexto suficiente.
- [ ] Job idempotente.

## Anti-patrones
- Calcular indices dentro del endpoint HTTP.
- Guardar rasters en PostgreSQL.
- Reportar a la API sin firma.


