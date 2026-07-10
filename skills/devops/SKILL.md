---
name: devops
description: DevOps del sistema IPTV/Internet: Docker y Docker Compose por entorno, Nginx como unica puerta publica, variables de entorno, redes internas, volumenes, backups, logs, health checks, desarrollo local, produccion y despliegues. Usa esta skill al tocar contenedores, compose, Nginx, variables de entorno o el despliegue. Se dispara con 'docker', 'compose', 'nginx', 'devops', 'despliegue', 'backup', 'health check', 'variables de entorno', 'infraestructura'.
---

# Skill de DevOps

Cómo se conteneriza y despliega. Solo Nginx expone puertos al host.

## Servicios
`nginx`, `frontend`, `backend`, `postgres`, `redis`. Archivos: `compose.yaml`, `compose.development.yaml`, `compose.production.yaml`. Config en `infrastructure/{nginx,docker,postgres,redis,scripts}`. Dockerfile por app (`apps/frontend/Dockerfile`, `apps/backend/Dockerfile`).

## Exposición de puertos
- Público solo por **Nginx** (`:80/:443`), que enruta a `frontend` y `backend`.
- **No publicar** backend, PostgreSQL, Redis ni el puerto interno del frontend. Se comunican por la red interna de Docker.

## Variables de entorno
- Todo secreto/config en `.env` (backend); `.env.example` con dummies. Validar env crítica al arranque y fallar rápido si falta.

## Redes, volúmenes, backups
- Red interna dedicada; datastores solo accesibles dentro de ella.
- Volúmenes persistentes para PostgreSQL y Redis.
- Backups programados de PostgreSQL (script en `infrastructure/scripts`), con retención y prueba de restauración.

## Logs y health checks
- Logs estructurados por servicio. Health check de backend (`/health`) y de datastores; Nginx no enruta a un backend no saludable.

## Entornos y despliegue
- Local: `compose.development.yaml` (hot reload, puertos de datastore tolerados solo en local).
- Producción: `compose.production.yaml`, imágenes construidas, `prisma migrate deploy` (nunca `db push`).
- Despliegue reproducible; migraciones aplicadas antes de levantar el backend nuevo.

## Checklist
- [ ] Solo Nginx expone puertos.
- [ ] `.env.example` con dummies; env crítica validada.
- [ ] Volúmenes + backups de Postgres.
- [ ] Health checks; logs por servicio.
- [ ] Prod usa `migrate deploy`, no `db push`.

## Anti-patrones
- Exponer 5432/6379/puerto backend al host en producción.
- Secretos en el compose o en la imagen.
- Desplegar sin aplicar migraciones.
