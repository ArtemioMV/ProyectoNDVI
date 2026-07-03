---
name: integration-tests
description: Escribe pruebas de integracion que cubren tenant, permisos, alcances y acceso cruzado entre organizaciones con fixtures minimos, evitando datos reales. Usa esta skill cuando se pida probar endpoints de API, verificar autorizacion/aislamiento multiempresa, cubrir el flujo permiso+scope+datos, o cuando digan 'pruebas de integracion', 'integration tests', 'testear el endpoint', 'probar permisos y tenant'. Aqui viven los casos obligatorios de seguridad multiempresa.
---

# Pruebas de integracion

## Cuando usar
Verificar el comportamiento real de la API con base de datos: autenticacion, permisos, tenancy, alcances y persistencia.

## Documentacion de referencia
- `docs/09-quality/testing-strategy.md`
- `docs/08-security/tenancy.md`

## Ubicacion
`apps/api/test/`

## Casos obligatorios (de la estrategia de pruebas)
- Un usuario NO puede ver datos de otra organizacion.
- Un permiso sin alcance no devuelve datos fuera de scope.
- Geometria invalida no se guarda.
- Un job geoespacial falla de forma recuperable.

## Reglas
- Cubrir tenant, permisos, alcances y datos cruzados.
- Fixtures minimos y claros; datos aislados por organizacion.
- Probar errores esperados (403/404/422) sin filtrar existencia de recursos ajenos.
- Evitar pruebas dependientes de datos reales.

## Checklist antes de terminar
- [ ] Caso de acceso cruzado entre organizaciones incluido.
- [ ] Permiso sin scope validado.
- [ ] Errores esperados verificados.
- [ ] Datos aislados por organizacion.

## Anti-patrones
- Reusar la misma organizacion para "probar" aislamiento.
- Depender de un dump de produccion.


