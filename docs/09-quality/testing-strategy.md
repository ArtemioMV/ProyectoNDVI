# Estrategia de pruebas

## Minimo

- Unit tests para reglas puras.
- Integration tests para API, permisos, tenancy y datos.
- E2E para flujos criticos.
- Pruebas geoespaciales con fixtures controlados.

## Casos obligatorios

- Usuario no puede ver datos de otra organizacion.
- Permiso sin alcance no devuelve datos fuera de scope.
- Geometria invalida no se guarda.
- Job geoespacial falla de forma recuperable.
