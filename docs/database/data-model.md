# Modelo de datos

La base inicial contiene usuarios, roles, permisos y auditoria. Los modulos funcionales se agregaran por fase mediante migraciones Prisma.

## Reglas

- Usar `Decimal` para dinero.
- No usar `float` para importes.
- Las operaciones financieras deben usar transacciones.
- Las eliminaciones sensibles deben ser logicas o por anulacion.
- Toda migracion debe tener motivo documentado.
