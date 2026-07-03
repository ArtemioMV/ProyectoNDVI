---
name: add-docker-service
description: Agrega un servicio nuevo al Docker Compose del ambiente correcto sin exponer PostgreSQL, Redis ni MinIO publicamente, manteniendo un Dockerfile por componente. Usa esta skill cuando se pida agregar un contenedor, servicio o dependencia a docker-compose, definir un Dockerfile nuevo, o cuando digan 'nuevo servicio docker', 'add service to compose', 'contenerizar', 'add container'. Para publicarlo por red usa add-nginx-route; para su config usa add-environment-variable.
---

# Agregar servicio Docker

## Cuando usar
Sumar un contenedor (o su Dockerfile) al stack local/staging/produccion.

## Documentacion obligatoria (leer antes)
- `docs/07-devops/docker.md`
- `docs/07-devops/environments.md`
- `docs/07-devops/nginx.md`

## Ubicacion
- Composes por ambiente: `infrastructure/docker/compose.local.yml`, `compose.staging.yml`, `compose.production.yml`.
- Dockerfile POR componente: `apps/web/Dockerfile`, `apps/api/Dockerfile`, `services/geo-worker/Dockerfile`. Nada de un Dockerfile gigante para todo.

## Reglas
- Agregar el servicio SOLO en el compose del ambiente que corresponde.
- No publicar puertos de PostgreSQL, Redis ni MinIO hacia el exterior en staging/produccion (en local se toleran para desarrollo).
- Declarar variables en `.env.example` con valores dummy (ver **add-environment-variable**).
- Definir healthcheck cuando el servicio lo permita.

## Referencia (stack local actual)
`postgres` = `postgis/postgis:16-3.4` (db `agro_spatial`), `redis:7-alpine`, `minio/minio` (consola 9001). Reutiliza estos nombres de servicio en las URLs internas.

## Checklist antes de terminar
- [ ] Servicio en el compose del ambiente correcto.
- [ ] Sin exponer datastores publicamente fuera de local.
- [ ] Variables documentadas en `.env.example`.
- [ ] Dockerfile por componente, no monolitico.
- [ ] Healthcheck definido si aplica.

## Anti-patrones
- Exponer `5432/6379/9000` en produccion.
- Hardcodear secretos en el compose.


