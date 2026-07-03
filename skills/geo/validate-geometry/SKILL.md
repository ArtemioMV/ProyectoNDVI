# Validar geometria

## Antes de modificar

- Leer `docs/03-database/spatial-model.md`.
- Leer `docs/02-domain/farms-lots.md`.

## Reglas

- Validar SRID, cierre, area mayor que cero y auto-intersecciones.
- Detectar superposiciones relevantes.
- Registrar historial de cambios de geometria.
- Agregar fixtures con geometria valida e invalida.
