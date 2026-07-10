# Docker

El proyecto usa Docker Compose con cinco servicios base:

- `nginx`
- `frontend`
- `backend`
- `postgres`
- `redis`

En produccion, Nginx es el unico servicio con puertos publicados. En desarrollo,
`compose.override.yaml` (que Docker Compose carga automaticamente) ademas publica el
puerto de Postgres (5432) para herramientas locales, y monta el codigo con HMR.

## Desarrollo

```bash
# Docker carga compose.yaml + compose.override.yaml automaticamente
docker compose up --build
```

## Produccion

```bash
docker compose -f compose.yaml -f compose.production.yaml up --build
```
