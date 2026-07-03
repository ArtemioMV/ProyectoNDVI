# AgroSpatial Intelligence Platform

Plataforma web SaaS multiempresa para inteligencia agricola geoespacial, monitoreo satelital, NDVI, proyecciones productivas y operaciones agricolas.

## Fuente de verdad

- Documento maestro: `docs/00-vision/AGRO_GEOSPATIAL_SAAS_MASTER_v0.4.md`
- Arquitectura del repositorio: `docs/01-architecture/repository-structure.md`
- Decisiones arquitectonicas: `docs/01-architecture/decisions/`
- Skills para agentes: `skills/`

## Arquitectura base

- `apps/web`: aplicacion web Next.js, React, TypeScript, Tailwind CSS y shadcn/ui.
- `apps/api`: API principal NestJS con autorizacion multiempresa, RBAC, data scopes y auditoria.
- `services/geo-worker`: worker Python para procesamiento geoespacial, raster, indices y estadisticas zonales.
- `packages`: contratos, tipos y configuraciones compartidas cuando exista una necesidad real.
- `infrastructure`: Docker, Nginx, base de datos, MinIO y scripts operativos.
- `docs`: documentacion viva del producto, arquitectura, dominio, seguridad y calidad.
- `skills`: instrucciones reutilizables para agentes de desarrollo.

## Reglas iniciales

1. No colocar configuraciones especificas de la web en la raiz.
2. Tailwind, PostCSS, `components.json` y estilos globales viven en `apps/web`.
3. La API nunca confia en `organization_id` enviado por el cliente como autoridad.
4. Todo dato de tenant debe filtrar por `organization_id` y alcance efectivo.
5. Los procesos geoespaciales pesados se ejecutan de forma asincrona.
6. Los archivos raster y objetos grandes se guardan en MinIO/S3, no en PostgreSQL.
7. Las decisiones importantes se registran como ADR.

## Estado

Este repositorio contiene la arquitectura documental y la estructura inicial. Aun no contiene una implementacion funcional del producto.

## Nombres oficiales

- Frontend = `apps/web`.
- Backend = `apps/api`.
- Worker geoespacial = `services/geo-worker`.

No crear carpetas paralelas `frontend/` o `backend/` en la raiz. En este monorepo las aplicaciones viven bajo `apps/` para mantener una estructura limpia y escalable.
