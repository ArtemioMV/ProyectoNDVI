# ERD canonico

El ERD construible vive por ahora en `apps/api/prisma/schema.prisma`.

## Decisiones activas

- Unidad fisica canonica: `parcel` (ADR-011).
- Area productiva canonica: `cultivable_area`.
- Multiempresa obligatoria: `organization_id` en toda entidad de cliente.
- Aislamiento tenant: aplicacion + RLS preparado (ADR-012).
- PostgreSQL + PostGIS para geometria.
- MinIO/S3 para objetos grandes; PostgreSQL guarda metadatos y referencias.
- BD legacy como origen de migracion, no como destino.

## Grupos de entidades

- Identidad y multiempresa: `organizations`, `users`, `organization_memberships`, `sessions`, `invitations`.
- RBAC y scopes: `roles`, `permissions`, `role_permissions`, `membership_roles`, `membership_permission_overrides`, `access_scopes`.
- Catalogos agricolas: `countries`, `crops`, `varieties`.
- Estructura agricola: `farms`, `parcels`, `parcel_geometries`, `campaigns`, `cultivable_areas`.
- Evaluaciones configurables: `evaluation_types`, `evaluations`, `evaluation_crops`, `evaluation_fields`, `record_statuses`, `evaluation_records`, `evaluation_record_audits`.
- Satelite y procesamiento: `satellite_sources`, `satellite_scenes`, `vegetation_indices`, `processing_jobs`, `processing_job_events`, `parcel_index_results`, `parcel_index_statistics`.
- Transversal: `stored_objects`, `audit_logs`, `integrations`.

## Referencias

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/manual/postgis_indexes_rls.sql`
- `docs/03-database/legacy-bd-vs-master-corrections.md`
- `docs/03-database/legacy/BD_ESTRUCTURA_FINAL_LIMPIA.md`


