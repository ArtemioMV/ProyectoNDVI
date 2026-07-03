# API

API principal NestJS.

## Reglas

- Resolver el tenant activo desde la sesion, no desde el body.
- Validar permisos por accion y alcance de datos.
- Aplicar filtro de `organization_id` en toda consulta de datos del cliente.
- Registrar auditoria en acciones sensibles.
- Mantener los procesos pesados fuera del request HTTP.
