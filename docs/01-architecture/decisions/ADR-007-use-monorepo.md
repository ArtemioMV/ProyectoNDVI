# ADR-007: Usar monorepo

- Estado: Aprobado inicial
- Fecha: 2026-07-03

## Decision

Organizar web, API, worker, paquetes, infraestructura, docs y skills en un unico repositorio.

## Consecuencias

- Contratos y tipos compartidos pueden vivir en `packages`.
- No se crean paquetes compartidos sin reutilizacion real.


