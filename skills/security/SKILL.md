---
name: security
description: Seguridad del sistema IPTV/Internet: autenticacion JWT, autorizacion por permiso recurso.accion, 4 roles, proteccion de secretos, validacion de propiedad de recursos, proteccion contra abuso, auditoria, manejo de errores sin fugas, reglas de contrasena y manejo de tokens. Usa esta skill al implementar o revisar login, guards, permisos, roles, manejo de secretos o auditoria. Se dispara con 'seguridad', 'auth', 'login', 'JWT', 'permiso', 'rol', 'token', 'secreto', 'auditoria'.
---

# Skill de seguridad

Reglas de seguridad del backend. La UI solo oculta; el backend siempre valida.

## Autenticación
- JWT o sesión segura. Contraseñas con hash fuerte (argon2/bcrypt), nunca en texto.
- Tokens con expiración corta; refresh controlado; revocar al suspender usuario.

## Autorización (RBAC)
- Permisos con formato `recurso.accion` (`clientes.crear`, `pagos.registrar`, `caja.reabrir`, `mensualidades.anular`, …).
- Roles iniciales: `ADMINISTRADOR`, `SECRETARIA_CAJA`, `TECNICO`, `INVENTARIO_VENTAS`. Un rol agrupa permisos.
- Guard de permiso por endpoint (`@RequirePermiso('pagos.registrar')`). El endpoint sensible SIEMPRE exige permiso.

## Propiedad de recursos
- Validar que el recurso pertenece al ámbito del usuario/rol antes de operar (evitar acceso por ID directo / IDOR).

## Secretos
- Claves de integraciones (DNI, WhatsApp, correo, mapas), JWT y BD solo en variables de entorno del backend. Nunca en el frontend, el repo ni logs. `.env.example` con valores dummy.

## Protección contra abuso
- Rate limiting en login y endpoints públicos (portal). Bloqueo temporal tras intentos fallidos.

## Auditoría
- Registrar acciones sensibles: login, anulaciones, reapertura de caja, ajustes de inventario, cambios de rol/permiso (actor, acción, entidad, fecha, motivo).

## Errores
- Mensajes de error sin filtrar internos (SQL, stack, existencia de recursos ajenos). Respuesta con `code` estable.

## Contraseñas
- Longitud mínima, complejidad razonable, no reutilización obvia; cambio y reseteo auditados.

## Checklist
- [ ] Hash de contraseña + tokens con expiración/revocación.
- [ ] Guard de permiso en endpoints sensibles.
- [ ] Validación de propiedad del recurso.
- [ ] Secretos solo en backend/env.
- [ ] Rate limit en login/portal + auditoría.

## Anti-patrones
- Confiar en que la UI ocultó la opción.
- Secretos en el frontend o el repo.
- Errores que revelan datos internos o existencia de recursos ajenos.
