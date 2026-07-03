# Procesar indice satelital

## Antes de modificar

- Leer `docs/02-domain/satellite-processing.md`.
- Leer `docs/01-architecture/data-flow.md`.

## Reglas

- Procesar fuera del request HTTP.
- Guardar objetos grandes en MinIO/S3.
- Guardar metadatos y estadisticas en PostgreSQL.
- Reportar resultado por endpoint interno firmado.
- No acoplar la arquitectura solo a NDVI.
