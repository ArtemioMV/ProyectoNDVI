---
name: tenancy-review
description: Revision profunda de aislamiento multiempresa: organization_id recibido del cliente como autoridad, consultas sin filtro de tenant, IDs no validados, exportaciones sin scope y jobs que pierden contexto de organizacion. Usa esta skill cuando se pida verificar el aislamiento entre organizaciones, revisar multi-tenancy, chequear fugas cross-tenant, o cuando digan 'revisa tenancy', 'aislamiento multiempresa', 'cross-tenant', 'fuga entre organizaciones'.
---

# Revision de tenancy

## Cuando usar
Cuando el cambio toca datos de cliente, listados, exportaciones o jobs y quieres garantizar el aislamiento entre organizaciones.

## Documentacion de referencia
- `docs/08-security/tenancy.md`
- `docs/02-domain/tenant-model.md`

## Revisar primero
- `organization_id` recibido desde el cliente y usado como autoridad.
- Consultas sin filtro de tenant (lectura Y escritura, incluidos conteos/agregados).
- IDs entrantes no validados contra la organizacion activa (IDOR).
- Exportaciones/descargas sin aplicar el alcance efectivo.
- Jobs y callbacks del worker que pierden el contexto de organizacion.
- Sesion que no revoca al suspender usuario o membresia.

## Casos de prueba que exigo ver
- Usuario de la organizacion A no obtiene datos de la organizacion B.
- Permiso sin alcance no devuelve datos fuera de scope.
- Recurso de otra organizacion referenciado por ID -> 403/404, sin filtrar existencia.

## Como reportar
Por consulta/endpoint: donde falta el tenant -> como se explota -> correccion (patron de **add-tenant-filter**).


