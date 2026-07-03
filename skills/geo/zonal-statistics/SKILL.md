---
name: zonal-statistics
description: Calcula estadisticas zonales de un raster de indice sobre la geometria de una parcela (promedio, min, max, desviacion, percentiles, distribucion por rangos) registrando calidad de escena y cobertura. Usa esta skill cuando se pida calcular estadisticas por zona/parcela, resumir un raster por poligono, obtener promedio/percentiles de un indice, o cuando digan 'estadisticas zonales', 'zonal stats', 'resumen por parcela', 'histograma del indice'. Suele ejecutarse despues de process-index.
---

# Estadisticas zonales (geo-worker)

## Cuando usar
Resumir el raster de un indice dentro de la geometria de una parcela/area para almacenar metricas comparables.

## Documentacion obligatoria (leer antes)
- `docs/02-domain/satellite-processing.md`
- `docs/06-design-system/data-visualization.md`

## Ubicacion
`services/geo-worker/src/processing/` (calculo) + `schemas/` (salida hacia la API).

## Reglas
- Calcular, segun aplique: promedio, minimo, maximo, desviacion, percentiles y distribucion por rangos.
- Registrar calidad de escena y cobertura efectiva (pixeles validos vs. enmascarados por nube/borde).
- Excluir pixeles invalidos/nubosos del calculo, no promediarlos como cero.
- Devolver el resumen a la API para persistir en PostgreSQL (no guardar aqui).
- Probar con un raster fixture pequeno de resultado conocido.

## Checklist antes de terminar
- [ ] Metricas correctas y documentadas.
- [ ] Cobertura y calidad de escena registradas.
- [ ] Pixeles invalidos excluidos.
- [ ] Test con fixture de valores esperados.

## Anti-patrones
- Reportar promedios sin indicar cobertura/nubosidad.
- Contar pixeles enmascarados como validos.


