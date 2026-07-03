---
name: architecture-review
description: Revision de arquitectura: archivos fuera de su contexto, paquetes compartidos sin necesidad real, procesos pesados dentro del request HTTP y cambios de decision sin ADR. Usa esta skill cuando se pida revisar la arquitectura, la estructura del monorepo, los limites entre web/api/worker, o cuando digan 'revisa arquitectura', 'architecture review', 'estructura del repo', 'esto necesita ADR'.
---

# Revision de arquitectura

## Cuando usar
Al revisar cambios estructurales, ubicacion de archivos, nuevos paquetes compartidos o decisiones que afectan limites entre componentes.

## Documentacion de referencia
- `docs/01-architecture/repository-structure.md`
- `docs/01-architecture/frontend-backend-boundaries.md`
- Los ADR relevantes en `docs/01-architecture/decisions/`.

## Revisar primero
- **Archivos fuera de contexto** â€” config de web en la raiz; carpetas `frontend/`/`backend/` en raiz (los nombres oficiales son `apps/web`, `apps/api`, `services/geo-worker`).
- **Paquetes compartidos sin reutilizacion real** en `packages/` (crear solo cuando hay reuso genuino).
- **Procesos pesados dentro del request HTTP** (debe publicarse un job).
- **Limites cruzados** â€” web accediendo directo a datastores; worker mutando estado de negocio sin contrato interno.
- **Cambios de decision sin ADR** â€” si cambia una decision registrada, exige/actualiza el ADR.

## Senales de rechazo (bloqueantes)
- Duplicar `frontend/`/`backend/` en raiz.
- Procesamiento geoespacial dentro del request.
- Cambio de decision estructural sin ADR.

## Como reportar
Por archivo/carpeta: donde deberia vivir y por que; que ADR falta o debe actualizarse.


