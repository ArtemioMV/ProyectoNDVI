# ADR-002: Usar NestJS para la API

- Estado: Aprobado inicial
- Fecha: 2026-07-03

## Decision

Usar NestJS para la API principal en `apps/api`.

## Reglas

- Controllers delgados.
- Logica de negocio en servicios o casos de uso.
- Autenticacion, autorizacion, tenancy y auditoria como capas explicitas.


