---
name: security-review
description: Revision de seguridad transversal contra el modelo de amenazas: acceso cruzado entre organizaciones, escalada de privilegios, secretos expuestos, endpoints internos sin firma y auditoria omitida. Usa esta skill cuando se pida una revision de seguridad, threat review, auditoria de seguridad de un cambio, o cuando digan 'revisa seguridad', 'security review', 'es seguro esto', 'riesgos de seguridad'. Para tenancy en profundidad usa tenancy-review.
---

# Revision de seguridad

## Cuando usar
Antes de mergear cambios sensibles (auth, permisos, jobs internos, manejo de archivos, secretos) o cuando pidan una revision de seguridad.

## Documentacion de referencia
- `docs/08-security/threat-model.md`
- `docs/08-security/tenancy.md`
- `docs/08-security/permissions.md`
- `docs/08-security/secrets.md`
- `docs/08-security/support-access.md`

## Revisar por amenaza (modelo inicial)
1. **Acceso cruzado entre organizaciones** â€” consultas sin tenant, IDs no validados.
2. **Escalada de privilegios** â€” permisos amplios, roles mal asignados, orden de autz roto.
3. **Fuga de rasters privados** â€” objetos MinIO accesibles sin control.
4. **Manipulacion de jobs internos** â€” callback del worker sin firma (`INTERNAL_WORKER_CALLBACK_SECRET`).
5. **Exposicion de secretos** â€” `.env` real, secreto en cliente, en logs o en el bundle.
6. **Auditoria incompleta** â€” accion sensible sin registro.

## Senales de rechazo (bloqueantes)
- Cualquier acceso cruzado entre organizaciones demostrable.
- Endpoint interno del worker sin firma.
- Secreto real commiteado (ademas: rotar y registrar incidente).

## Como reportar
Por amenaza: hallazgo -> severidad -> correccion concreta. No mezclar con estilo.


