---
name: permissions-matrix
description: Disena una matriz de permisos que permite buscar y filtrar, distingue heredado/directo/denegado y muestra el impacto antes de guardar, sin confundir jerarquia visual con autorizacion real. Usa esta skill cuando se pida construir la UI de roles y permisos, una matriz o tabla de permisos, la pantalla de asignacion de accesos, o cuando digan 'matriz de permisos', 'permissions matrix', 'gestion de roles', 'asignar permisos', 'pantalla de accesos'.
---

# Matriz de permisos

## Cuando usar
UI para visualizar/administrar roles y permisos por organizacion.

## Documentacion de referencia
- `docs/02-domain/identity-access.md`
- `docs/08-security/permissions.md`

## Reglas
- Permitir buscar y filtrar permisos (`recurso.accion`).
- Distinguir claramente heredado, directo y denegado.
- No confundir la jerarquia VISUAL con la autorizacion REAL (la API es la autoridad final).
- Mostrar el impacto del cambio antes de guardar (que se habilita/deshabilita).

## Checklist antes de terminar
- [ ] Busqueda/filtrado de permisos.
- [ ] Estados heredado / directo / denegado visibles.
- [ ] Vista previa de impacto antes de confirmar.
- [ ] La UI no implica que decide seguridad.

## Anti-patrones
- Mostrar permisos efectivos calculados solo en el cliente como si fueran la verdad.
- Guardar cambios masivos sin previsualizar el efecto.


