# Despliegue

## Local

Usar `infrastructure/docker/compose.local.yml` para PostgreSQL/PostGIS, Redis y MinIO.

## Staging y produccion

- Nginx debe ser la unica puerta publica.
- PostgreSQL, Redis y MinIO no deben exponerse directamente.
- Las credenciales deben manejarse como secretos por ambiente.
- El worker debe comunicarse con la API mediante canal interno y firma.


