# Crear endpoint multiempresa

## Antes de modificar

- Leer `docs/04-api/conventions.md`.
- Leer `docs/08-security/tenancy.md`.
- Leer `docs/08-security/permissions.md`.
- Leer el modulo existente.

## Reglas

- Validar autenticacion.
- Resolver `organization_id` desde la sesion.
- No aceptar `organization_id` como autoridad desde el body.
- Validar permiso por accion.
- Aplicar alcance de datos.
- Registrar auditoria si la accion es sensible.
- Agregar prueba de acceso cruzado entre organizaciones.

## No hacer

- No colocar logica de negocio en controller.
- No consultar sin tenant.
- No exponer errores internos.
