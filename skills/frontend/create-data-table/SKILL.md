---
name: create-data-table
description: Crea una tabla de datos en apps/web con paginacion, orden estable y estados de carga/vacio/error, reflejando permisos por fila sin asumir seguridad final. Usa esta skill cuando se pida crear una tabla, listado, grilla, data table o vista tabular en el frontend, o cuando digan 'nueva tabla', 'data table', 'listado paginado', 'grilla de datos'. Se apoya en la paginacion del backend.
---

# Crear tabla de datos (frontend)

## Cuando usar
Mostrar listados operativos (parcelas, jobs, alertas, usuarios) con paginacion.

## Documentacion obligatoria (leer antes)
- `docs/06-design-system/components.md`
- `docs/06-design-system/data-visualization.md`
- `docs/04-api/pagination.md`

## Ubicacion
`apps/web/src/components/tables/` para la tabla base; columnas/acciones por dominio en la feature.

## Reglas
- Soportar estados: cargando, vacio, error.
- Paginacion del lado servidor con orden estable; no traer todos los datos si el endpoint pagina.
- Reflejar acciones por fila segun permiso, sin asumir seguridad final (la API valida).
- Densidad util y sin tarjetas anidadas (design system operativo).

## Checklist antes de terminar
- [ ] Estados cargando / vacio / error.
- [ ] Paginacion server-side + orden estable.
- [ ] Acciones por fila condicionadas por permiso visible.
- [ ] Sin cargar el dataset completo cuando el endpoint pagina.

## Anti-patrones
- Ordenar/paginar en cliente sobre datos que deberian venir paginados.
- Mostrar acciones que el usuario no puede ejecutar.


