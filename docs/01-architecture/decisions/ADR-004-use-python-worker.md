# ADR-004: Usar worker Python geoespacial

- Estado: Aprobado inicial
- Fecha: 2026-07-03

## Decision

Ejecutar procesamiento geoespacial pesado en `services/geo-worker`, fuera de requests HTTP largos.

## Consecuencias

- Comunicacion por cola.
- Resultados enviados a la API por endpoint interno firmado.
- El worker no es una API publica.


