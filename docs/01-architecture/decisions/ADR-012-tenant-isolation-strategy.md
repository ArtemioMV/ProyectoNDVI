# ADR-012: Estrategia de aislamiento tenant

- Estado: Aprobado inicial
- Fecha: 2026-07-03
- Responsable: Equipo de plataforma

## Contexto

La fuga de datos entre organizaciones es el mayor riesgo del SaaS. La aplicacion siempre debe filtrar por `organization_id`, pero un error de repositorio o SQL manual podria exponer datos de otro cliente.

## Decision

Usar defensa en profundidad:

1. Capa de aplicacion obligatoria: resolver `organization_id` desde sesion/membresia, validar permiso y aplicar alcance.
2. Base de datos: preparar Row-Level Security por `organization_id` para entidades de cliente.

El script `apps/api/prisma/manual/postgis_indexes_rls.sql` contiene la plantilla inicial de indices PostGIS/JSONB y politicas RLS. La activacion operativa de RLS por ambiente se hara con migracion manual revisada.

## Consecuencias positivas

- Reduce impacto de consultas sin tenant.
- Refuerza el limite entre organizaciones.
- Alinea base de datos con el riesgo principal documentado.

## Consecuencias negativas

- Requiere que la app fije el tenant de sesion en la conexion/transaccion.
- Pruebas de integracion deben validar RLS y contexto de tenant.
- SQL manual necesita disciplina adicional.

## Reglas

- El rol de aplicacion no debe tener `BYPASSRLS`.
- No se acepta `organization_id` del body como autoridad.
- Toda entidad de cliente debe incluir `organization_id`.


