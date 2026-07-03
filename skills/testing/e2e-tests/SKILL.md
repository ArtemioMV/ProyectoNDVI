---
name: e2e-tests
description: Escribe pruebas end-to-end de flujos criticos completos validando permisos visibles y la respuesta real de la API, con datos aislados por organizacion. Usa esta skill cuando se pida probar un flujo completo de usuario, e2e, un recorrido critico (login -> organizacion -> parcela -> procesar NDVI), o cuando digan 'pruebas e2e', 'end to end', 'flujo completo', 'test del recorrido'. Para casos de API aislados usa integration-tests.
---

# Pruebas E2E

## Cuando usar
Validar flujos criticos completos de punta a punta (ej. login -> seleccionar organizacion -> ver parcelas -> solicitar procesamiento NDVI -> ver resultado).

## Documentacion de referencia
- `docs/09-quality/testing-strategy.md`

## Reglas
- Cubrir flujos criticos completos, no pantallas sueltas.
- Validar tanto los permisos visibles en la UI como la respuesta REAL de la API.
- Usar datos aislados por organizacion; limpiar/aislar entre corridas.
- Evitar dependencias de datos reales.

## Checklist antes de terminar
- [ ] Flujo critico completo cubierto.
- [ ] Permiso visible + autorizacion de API verificados.
- [ ] Datos aislados por organizacion.
- [ ] Estable (sin dependencias externas fragiles).

## Anti-patrones
- E2E que solo verifican la UI y no la respuesta de la API.
- Flujos que dejan datos que rompen la siguiente corrida.


