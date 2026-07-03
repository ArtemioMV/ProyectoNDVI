# ADR-011: Nombre canonico de unidad fisica agricola

- Estado: Aprobado inicial
- Fecha: 2026-07-03
- Responsable: Equipo de plataforma

## Contexto

El master v0.4 conserva referencias historicas a lote, pero las secciones 63, 78 y 89 consolidan el modelo destino alrededor de `parcel` y `cultivable_area`, retirando `subparcela` como concepto funcional. La BD legacy contiene `parcela`, `subparcela`, `lote` y `sublote`, pero el documento de correcciones la clasifica como origen legacy, no como modelo destino.

## Decision

El nombre interno canonico de la unidad fisica agricola sera `parcel`.

La etiqueta visible para el cliente podra configurarse por organizacion: Lote, Parcela, Cuartel, Bloque u otra denominacion local. Esa etiqueta no cambia nombres internos, tablas, contratos ni permisos.

## Consecuencias

- Carpetas backend: `apps/api/src/modules/parcels`.
- Carpetas frontend: `apps/web/src/features/parcels`.
- Tablas canonicas: `parcels`, `parcel_geometries`, `parcel_index_results`, `parcel_index_statistics`.
- Permisos canonicos: `parcels.read`, `parcels.create`, `parcels.geometry.update`, etc.
- `subparcela`, `lote` y `sublote` quedan como conceptos legacy a inventariar y migrar, no como modelo destino.

## Alternativas consideradas

- Usar `lot` como nombre interno: descartado porque contradice la consolidacion del master v0.4 y mantiene ambiguedad con la BD legacy.
- Mantener `lot` y `parcel`: descartado porque duplica la unidad fisica y aumenta riesgo de errores de permisos, contratos y migraciones.

## Riesgos

Si el inventario del parrafo 78.4 demuestra que `lote` representa una subdivison real distinta de `parcel`, se podra introducir un nivel opcional `sublot` mediante nuevo ADR y migracion controlada.

