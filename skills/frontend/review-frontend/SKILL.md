---
name: review-frontend
description: Revisa cambios de frontend (apps/web) buscando acciones visibles sin permiso, roturas en mobile, estados faltantes, acceso directo a servicios internos y duplicacion de componentes. Usa esta skill cuando se pida revisar, auditar o dar feedback de codigo del frontend/web, revisar un PR de apps/web, o cuando digan 'revisa el frontend', 'review web', 'code review UI'. Para accesibilidad puntual usa accessibility-review.
---

# Revision frontend

## Cuando usar
Antes de aprobar cambios en `apps/web` o al dar feedback de una vista/feature.

## Documentacion de referencia
- `docs/05-frontend/architecture.md`
- `docs/06-design-system/principles.md`
- `docs/01-architecture/frontend-backend-boundaries.md`

## Revisar primero (por prioridad)
1. **Acciones visibles sin permiso** o, peor, dependencia de ocultar el boton como "seguridad".
2. **Acceso directo a servicios internos** (Postgres/Redis/MinIO) o secretos en cliente.
3. **Estados faltantes**: cargando, vacio, error, sin permiso.
4. **Mobile**: textos/controles que se rompen o se salen.
5. **Duplicacion** de componentes que ya existen en `src/components`.
6. **Densidad/diseno**: tarjetas anidadas, composicion de marketing en vistas operativas.

## Senales de rechazo (bloqueantes)
- Cliente que asume autorizacion final.
- Secreto de servidor filtrado al bundle.

## Como reportar
Por componente/archivo: problema -> impacto en usuario/seguridad -> correccion. Prioriza seguridad visible y estados faltantes.


