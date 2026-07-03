# ADR-003: Usar PostgreSQL y PostGIS

- Estado: Aprobado inicial
- Fecha: 2026-07-03

## Decision

Usar PostgreSQL con PostGIS para datos relacionales y geometrias.

## Consecuencias

- Geometrias con SRID 4326.
- Operaciones espaciales avanzadas pueden usar SQL directo controlado.
- Archivos raster grandes no se guardan en PostgreSQL.


