-- postgis_indexes_rls.sql
-- Aplicar despues de `prisma migrate`.
-- Prisma no gestiona indices sobre columnas PostGIS `Unsupported` ni politicas RLS.
-- Recomendado: incluir como migracion manual revisada.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Indices espaciales GIST
CREATE INDEX IF NOT EXISTS idx_farms_geom             ON farms             USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_parcels_geom           ON parcels           USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_parcel_geometries_geom ON parcel_geometries USING GIST (geom);

-- Indice JSONB para datos de evaluacion
CREATE INDEX IF NOT EXISTS idx_evaluation_records_data ON evaluation_records USING GIN (data);

-- RLS opcional - defensa en profundidad segun ADR-012.
-- La app debe fijar el tenant por sesion/transaccion, por ejemplo:
-- SET app.current_org = '<uuid>';
--
-- ALTER TABLE parcels              ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cultivable_areas     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE evaluation_records   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE processing_jobs      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE parcel_index_results ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY tenant_isolation_parcels ON parcels
--   USING (organization_id = current_setting('app.current_org', true)::uuid);
-- CREATE POLICY tenant_isolation_cultivable_areas ON cultivable_areas
--   USING (organization_id = current_setting('app.current_org', true)::uuid);
-- CREATE POLICY tenant_isolation_evaluation_records ON evaluation_records
--   USING (organization_id = current_setting('app.current_org', true)::uuid);
-- CREATE POLICY tenant_isolation_processing_jobs ON processing_jobs
--   USING (organization_id = current_setting('app.current_org', true)::uuid);
-- CREATE POLICY tenant_isolation_parcel_index_results ON parcel_index_results
--   USING (organization_id = current_setting('app.current_org', true)::uuid);
--
-- Repetir el patron para cada entidad de cliente con organization_id.
-- El rol de aplicacion no debe tener BYPASSRLS.
