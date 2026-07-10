# ADR-001: Monolito modular

## Estado

Aceptada.

## Contexto

El sistema necesita crecer por modulos sin introducir complejidad operacional innecesaria desde el inicio.

## Decision

Iniciar como monolito modular con NestJS, React, Prisma, PostgreSQL y Redis.

## Consecuencias

- Menor complejidad de despliegue.
- Modulos con responsabilidades separadas.
- Posibilidad de extraer componentes en el futuro si el volumen lo justifica.
