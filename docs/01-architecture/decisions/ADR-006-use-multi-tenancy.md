# ADR-006: SaaS multiempresa desde el diseno

- Estado: Aprobado inicial
- Fecha: 2026-07-03

## Decision

Toda entidad del cliente incluye `organization_id` y toda consulta debe aplicar tenant y alcance.

## Consecuencias

- El usuario global puede pertenecer a varias organizaciones.
- La organizacion activa se valida contra membresias reales.
- No se confia en el tenant enviado desde el frontend como autoridad.
