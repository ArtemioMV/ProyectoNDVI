# Revision de job geoespacial

## Antes de revisar

- Leer `docs/01-architecture/data-flow.md`.
- Leer `docs/10-operations/job-recovery.md`.

## Revisar primero

- Jobs no idempotentes.
- Archivos grandes en base de datos.
- Errores no recuperables.
- Falta de trazabilidad.
- Dependencia directa de un solo proveedor sin adaptador.
