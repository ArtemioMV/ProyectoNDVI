# Recortar raster

## Antes de modificar

- Leer `docs/02-domain/satellite-processing.md`.
- Leer `docs/03-database/spatial-model.md`.

## Reglas

- Validar geometria antes del recorte.
- Preservar metadatos de fuente, fecha, resolucion y calidad.
- Guardar resultado en MinIO/S3.
- Reportar errores recuperables con contexto suficiente.
