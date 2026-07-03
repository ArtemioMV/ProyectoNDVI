---
name: unit-tests
description: Escribe pruebas unitarias para reglas puras y casos borde sin dependencias externas, con fixtures pequenos, cubriendo errores esperados. Usa esta skill cuando se pida agregar o mejorar tests unitarios, probar una funcion/regla de negocio aislada, o cuando digan 'pruebas unitarias', 'unit tests', 'testear esta funcion', 'cubrir casos borde'. Para API/permisos/tenancy usa integration-tests.
---

# Pruebas unitarias

## Cuando usar
Probar reglas puras (use-cases sin IO, formulas de indices, validaciones de geometria) de forma aislada.

## Documentacion de referencia
- `docs/09-quality/testing-strategy.md`

## Ubicacion
- API/NestJS: junto al codigo o en `apps/api/test/`.
- Worker/Python: `services/geo-worker/tests/` (pytest, ver `pyproject.toml`).

## Reglas
- Probar reglas puras y casos borde; sin dependencias externas (mockear IO).
- Fixtures pequenos y deterministas.
- Cubrir tambien los errores esperados, no solo el camino feliz.

## Checklist antes de terminar
- [ ] Camino feliz + bordes + errores esperados.
- [ ] Sin red/db/archivos reales.
- [ ] Fixtures minimos y claros.

## Anti-patrones
- Tests que dependen de datos reales o de la fecha del sistema.
- Un solo test del "happy path".


