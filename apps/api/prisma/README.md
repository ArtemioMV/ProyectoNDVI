# Prisma schema canonico - Agro Geospatial SaaS

Esquema de base de datos destino para v0.4: multiempresa, PostGIS, RBAC `recurso.accion`, auditoria y motor de evaluaciones legacy adaptado.

## Contenido

- `schema.prisma`: esquema principal canonico.
- `manual/postgis_indexes_rls.sql`: indices GIST/GIN y plantilla RLS que Prisma no gestiona sobre columnas PostGIS `Unsupported`.
- `seed.ts`: seed idempotente de permisos, roles plantilla y catalogos base.
- `SEED-README.md`: instrucciones operativas del seed.

## Decisiones asumidas

1. Unidad fisica canonica: `parcel` segun ADR-011.
2. La BD legacy es origen de migracion, no destino.
3. IDs UUID opacos con `gen_random_uuid()`.
4. Baja logica con `deleted_at`.
5. Timestamps `created_at` y `updated_at`.
6. Nombres internos en ingles, tablas snake_case plural mediante `@@map`.
7. `organization_id` en toda entidad de cliente.
8. RLS preparado como defensa en profundidad segun ADR-012.
9. Evaluaciones configurables conservan el patron hibrido relacional + JSONB del legacy.

## Uso previsto

Cuando se instalen dependencias y exista `DATABASE_URL` contra PostgreSQL + PostGIS:

```bash
npx prisma validate
npx prisma migrate dev --name init
```

Despues, incorporar `manual/postgis_indexes_rls.sql` como migracion SQL manual revisada.

## No hacer

- No convertir `docs/03-database/legacy/BD_ESTRUCTURA_FINAL_LIMPIA.md` en migracion directa.
- No reintroducir `subparcela`, `lote` o `sublote` en el modelo destino sin inventario y nuevo ADR.
- No activar RLS en produccion sin pruebas de contexto tenant por conexion/transaccion.
