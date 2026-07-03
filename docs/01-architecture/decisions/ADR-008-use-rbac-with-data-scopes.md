# ADR-008: RBAC con alcances de datos

- Estado: Aprobado inicial
- Fecha: 2026-07-03

## Decision

Combinar RBAC, permisos por accion, data scopes, excepciones controladas y auditoria.

## Regla

Un alcance nunca amplia un permiso inexistente. Primero se valida la accion; despues se filtran los datos permitidos.
