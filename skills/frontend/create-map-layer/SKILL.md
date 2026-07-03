---
name: create-map-layer
description: Crea una capa de mapa MapLibre en apps/web separando visualizacion de persistencia, manejando estados de mapa (sin geometria, cargando, error) y sin guardar geometria sin validacion de API. Usa esta skill cuando se pida agregar una capa raster o vectorial, dibujar/editar/importar geometria, mostrar poligonos de parcelas o resultados NDVI en el mapa, o cuando digan 'capa de mapa', 'map layer', 'mapa', 'poligonos', 'raster overlay', 'MapLibre'. La persistencia final de geometria la valida la API y PostGIS.
---

# Crear capa de mapa (MapLibre)

## Cuando usar
Visualizar o editar datos espaciales en la web (poligonos de parcelas, overlays raster de indices, dibujo/edicion de geometria).

## Documentacion obligatoria (leer antes)
- `docs/05-frontend/maps.md`
- `docs/06-design-system/map-states.md`
- `docs/03-database/spatial-model.md`
- `docs/01-architecture/decisions/ADR-005-use-maplibre.md`

## Ubicacion
`apps/web/src/components/maps/` (base) + capas/controles del dominio en la feature.

## Reglas
- Separar visualizacion de persistencia: dibujar en el cliente NO guarda geometria.
- Manejar los estados de mapa definidos: carga, sin geometria, geometria invalida, interseccion, escena sin datos, nubosidad alta, procesamiento pendiente.
- Geometria objetivo: MultiPolygon, SRID 4326.
- No guardar geometria sin validacion de la API; la validacion final vive en API + PostGIS.
- Cuidar rendimiento con muchos poligonos (simplificar/clusterizar segun zoom).

## Checklist antes de terminar
- [ ] Visualizacion desacoplada de persistencia.
- [ ] Estados de mapa cubiertos (sin datos, cargando, error, invalida...).
- [ ] Geometria enviada a la API para validar antes de persistir.
- [ ] Rendimiento aceptable con volumen alto de features.

## Anti-patrones
- Persistir la geometria dibujada sin pasar por validacion de API.
- Asumir un solo proveedor de tiles sin abstraccion.


