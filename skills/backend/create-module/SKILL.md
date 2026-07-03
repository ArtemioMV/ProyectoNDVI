# Crear modulo backend

## Antes de modificar

- Leer `docs/01-architecture/component-diagram.md`.
- Leer `docs/01-architecture/frontend-backend-boundaries.md`.
- Leer `docs/04-api/conventions.md`.
- Leer `docs/08-security/tenancy.md`.

## Reglas

- Crear modulo dentro de `apps/api/src/modules`.
- Separar controller, servicio/caso de uso, DTO y pruebas.
- Aplicar tenant, permisos, scopes y auditoria desde el inicio.
- Documentar permisos nuevos en `docs/08-security/permissions.md`.
