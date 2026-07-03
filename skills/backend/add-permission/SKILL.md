---
name: add-permission
description: Define un permiso nuevo con formato recurso.accion, clave estable e independiente del texto de UI, y su alcance aplicable. Usa esta skill SIEMPRE que se agregue una capacidad, accion protegida o permiso RBAC nuevo (por ejemplo satellite.ndvi.process, parcels.geometry.update, users.invite), o cuando digan 'nuevo permiso', 'add permission', 'proteger accion', 'nueva capacidad' o 'RBAC'. Complementa a create-endpoint (que consume el permiso).
---

# Agregar permiso (RBAC)

## Cuando usar
Introducir una accion protegida nueva. Todo endpoint sensible debe exigir un permiso.

## Documentacion obligatoria (leer antes)
- `docs/08-security/permissions.md`
- `docs/02-domain/identity-access.md`

## Regla de formato
`recurso.accion` â€” clave estable, en ingles, minusculas, NO derivada del texto visible de la UI.

Ejemplos existentes: `organizations.read`, `users.invite`, `roles.assign`, `parcels.geometry.update`, `satellite.ndvi.process`, `projections.publish`, `pruning.events.validate`.

## Flujo paso a paso
1. Nombrar el permiso con `recurso.accion` coherente con permisos existentes.
2. Definir el alcance sobre el que aplica (organizacion, fundo, parcela, area cultivable o recurso asignado).
3. Registrar la clave en el seed/catalogo de permisos cuando exista (`apps/api/prisma/seed`).
4. Documentar el permiso nuevo en `docs/08-security/permissions.md`.
5. Consumirlo en el endpoint/use-case con la comprobacion de autorizacion.
6. Agregar pruebas: permitido, denegado y acceso fuera de alcance.

## Checklist antes de terminar
- [ ] Clave estable y no dependiente de la UI.
- [ ] Alcance definido explicitamente.
- [ ] Registrado en catalogo/seed y documentado.
- [ ] 3 pruebas: allow / deny / fuera de scope.

## Anti-patrones
- Reutilizar un permiso amplio para tapar una accion sensible especifica.
- Cambiar la clave de un permiso ya emitido (rompe roles asignados). Si debe cambiar, migrar.


