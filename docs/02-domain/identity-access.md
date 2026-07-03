# Identidad y acceso

## Principios

- Correo unico global.
- Roles por organizacion.
- Permisos por accion con claves estables.
- Alcances por organizacion, fundo, parcela/lote, area cultivable o recurso asignado.
- La API es la autoridad final.

## Permisos

Formato recomendado: `recurso.accion`.

Ejemplos: `lots.read`, `lots.geometry.update`, `satellite.ndvi.process`, `audit.read`.
