# Agregar servicio Docker

## Antes de modificar

- Leer `docs/07-devops/docker.md`.
- Leer `docs/07-devops/nginx.md`.

## Reglas

- Agregar servicio en el compose del ambiente correcto.
- No exponer bases de datos, Redis ni MinIO publicamente.
- Documentar variables de ambiente en `.env.example`.
- Mantener Dockerfile por componente.
