# Seed de datos base

`seed.ts` siembra el catalogo inicial del sistema. Es idempotente: puede ejecutarse varias veces sin duplicar registros.

## Contenido

| Grupo | Registros | Fuente de verdad |
| --- | --- | --- |
| `permissions` | 15 claves `recurso.accion` | `docs/08-security/permissions.md` |
| Roles de sistema | Administrador, Operador agricola, Visualizador | Plantillas copiables por organizacion |
| `record_statuses` | borrador, enviado, validado, rechazado | Motor de evaluaciones |
| `vegetation_indices` | NDVI, NDRE, NDMI, SAVI, EVI | Arquitectura desacoplada de NDVI |
| `satellite_sources` | Sentinel-2 activo, Landsat 8/9 inactivo | Proveedores iniciales |
| `countries` | PE, CL, CO, EC, MX | Catalogo minimo editable |
| `crops` | Arandano, Palto, Uva | Catalogo minimo editable |

No siembra permisos post-MVP como `projections.publish` ni `pruning.events.validate`.

## Ejecucion

Desde `apps/api`, con `DATABASE_URL` apuntando a PostgreSQL + PostGIS:

```bash
npx prisma db seed
```

`prisma migrate dev` y `prisma migrate reset` tambien ejecutan el seed si la configuracion `prisma.seed` esta presente en `package.json`.

## Reglas

- Todo permiso nuevo pasa por la skill `skills/backend/add-permission/SKILL.md`.
- Documentar el permiso en `docs/08-security/permissions.md` antes de agregarlo a `PERMISSIONS`.
- Los roles de sistema son plantillas, no roles finales de una organizacion especifica.
- No renombrar claves de permisos ya emitidas sin migracion.
