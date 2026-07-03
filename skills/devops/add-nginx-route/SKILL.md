---
name: add-nginx-route
description: Agrega o modifica una ruta en Nginx, la unica puerta publica, enrutando solo a web y API y sin exponer PostgreSQL, Redis ni MinIO. Usa esta skill cuando se pida publicar un servicio, agregar un location/proxy_pass, configurar el reverse proxy o exponer un endpoint hacia afuera, o cuando digan 'ruta nginx', 'nginx route', 'reverse proxy', 'publicar servicio', 'proxy'. Complementa a add-docker-service.
---

# Agregar ruta Nginx

## Cuando usar
Exponer publicamente una ruta nueva o cambiar el enrutado del reverse proxy.

## Documentacion obligatoria (leer antes)
- `docs/07-devops/nginx.md`

## Ubicacion
- `infrastructure/nginx/nginx.conf` (incluye `conf.d/*.conf`).
- Definir `server`/`location` en `infrastructure/nginx/conf.d/` o `templates/`.

## Reglas
- Nginx es la UNICA puerta publica; solo enruta a `apps/web` y `apps/api`.
- Nunca exponer PostgreSQL, Redis ni MinIO directamente.
- El worker geoespacial es privado: no se publica.
- Documentar la ruta nueva y probar healthchecks cuando existan.

## Checklist antes de terminar
- [ ] La ruta va a web o api, no a un datastore interno.
- [ ] geo-worker sigue privado.
- [ ] Ruta documentada.
- [ ] Health check probado si existe.

## Anti-patrones
- `proxy_pass` directo a Postgres/Redis/MinIO.
- Publicar el endpoint interno firmado del worker.


