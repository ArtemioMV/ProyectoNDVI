# Revision de tenancy

## Antes de revisar

- Leer `docs/08-security/tenancy.md`.
- Leer `docs/02-domain/tenant-model.md`.

## Revisar primero

- `organization_id` recibido desde cliente como autoridad.
- Consultas sin filtro de tenant.
- IDs no validados contra organizacion activa.
- Exportaciones sin scope.
- Jobs que pierden contexto de tenant.
