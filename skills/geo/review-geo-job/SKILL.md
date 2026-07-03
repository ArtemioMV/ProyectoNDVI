---
name: review-geo-job
description: Revisa un job geoespacial buscando falta de idempotencia, archivos grandes en base de datos, errores no recuperables, falta de trazabilidad y acoplamiento a un solo proveedor. Usa esta skill cuando se pida revisar el worker geoespacial, auditar un job de procesamiento satelital, revisar un PR de services/geo-worker, o cuando digan 'revisa el job geo', 'review geo worker', 'auditar procesamiento satelital'. Complementa a process-index.
---

# Revision de job geoespacial

## Cuando usar
Antes de aprobar cambios en `services/geo-worker` o el flujo de jobs.

## Documentacion de referencia
- `docs/01-architecture/data-flow.md`
- `docs/10-operations/job-recovery.md`
- `docs/02-domain/satellite-processing.md`

## Revisar primero (por prioridad)
1. **Idempotencia** â€” reprocesar el mismo job no debe duplicar resultados.
2. **Archivos grandes en base de datos** â€” rasters/previews deben ir a MinIO/S3.
3. **Errores no recuperables** â€” deben fallar de forma recuperable, con reintento controlado.
4. **Trazabilidad** â€” job_id, organizacion, parcela, escena y auditoria presentes de punta a punta.
5. **Acoplamiento a un solo proveedor** sin adaptador (`providers/`).
6. **Callback a la API** sin firma interna.

## Senales de rechazo (bloqueantes)
- Job no idempotente que puede duplicar resultados.
- Perdida de contexto de organizacion/tenant en el worker.
- Reporte a la API sin el secreto interno firmado.

## Como reportar
Por etapa del job: problema -> riesgo operativo -> correccion. Prioriza idempotencia y trazabilidad.


