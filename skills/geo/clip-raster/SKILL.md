---
name: clip-raster
description: Recorta un raster satelital a la geometria de una parcela validando la geometria antes del recorte y preservando metadatos de fuente, fecha, resolucion y calidad. Usa esta skill cuando se pida recortar un raster, hacer clip/mask por geometria, extraer el area de una parcela de una escena, o cuando digan 'recortar raster', 'clip raster', 'mask por poligono', 'cortar escena'. Es un paso previo tipico de process-index y zonal-statistics.
---

# Recortar raster (geo-worker)

## Cuando usar
Aislar la porcion de una escena que corresponde a una parcela/area antes de calcular indices o estadisticas.

## Documentacion obligatoria (leer antes)
- `docs/02-domain/satellite-processing.md`
- `docs/03-database/spatial-model.md`

## Ubicacion
`services/geo-worker/src/processing/`

## Reglas
- Validar la geometria antes del recorte (ver **validate-geometry**): SRID 4326, cierre, area > 0, sin auto-intersecciones.
- Alinear SRID entre raster y geometria antes del mask.
- Preservar metadatos: fuente, fecha de escena, resolucion, calidad/nubosidad.
- Guardar el resultado en MinIO/S3, no en base de datos.
- Reportar errores recuperables con contexto (job, escena, parcela).

## Checklist antes de terminar
- [ ] Geometria validada y SRID alineado.
- [ ] Metadatos de fuente/fecha/resolucion/calidad preservados.
- [ ] Resultado en MinIO/S3.
- [ ] Fixture pequeno de raster+geometria en tests.

## Anti-patrones
- Recortar con geometria no validada.
- Perder la referencia de nubosidad/calidad de la escena.


