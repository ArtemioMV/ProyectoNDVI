---
name: review-backend
description: Revisa cambios de backend (NestJS/apps/api) buscando consultas sin tenant, permisos incompletos, logica pesada en controllers, errores internos expuestos y auditoria faltante. Usa esta skill cuando se pida revisar, auditar o dar feedback de codigo del backend/API, revisar un PR de apps/api, o cuando digan 'revisa el backend', 'review API', 'code review backend'. Para revision transversal de seguridad usa security-review; para tenancy profunda usa tenancy-review.
---

# Revision backend

## Cuando usar
Antes de aprobar cambios en `apps/api`, o cuando te pidan feedback de un endpoint/modulo/PR de backend.

## Documentacion de referencia
- `docs/04-api/conventions.md`
- `docs/08-security/tenancy.md`
- `docs/08-security/permissions.md`
- `docs/09-quality/definition-of-done.md`

## Revisar primero (por prioridad)
1. **Consultas sin tenant** â€” cualquier acceso a entidad de cliente sin `organization_id`.
2. **Permisos** â€” endpoint sensible sin `recurso.accion`; orden autz roto (permiso antes que membresia).
3. **`organization_id` desde el body** usado como autoridad.
4. **Logica de negocio en controllers** (debe estar en use-cases).
5. **Errores internos expuestos** (SQL, trazas, secretos).
6. **Auditoria faltante** en acciones sensibles.
7. **Listados** sin paginacion ni orden estable.

## Senales de rechazo (bloqueantes)
- Falta filtro de tenant o validacion de ID entrante.
- Endpoint sensible sin permiso.
- Sin prueba de acceso cruzado entre organizaciones cuando aplica.

## Como reportar
Lista concreta por archivo/linea: problema -> riesgo -> correccion sugerida. Prioriza seguridad y regresiones de tenant sobre estilo.


