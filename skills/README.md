# Skills del proyecto

Instrucciones reutilizables para agentes de desarrollo (Claude Code). No reemplazan la documentacion: la referencian. La documentacion en `docs/` es la fuente de verdad.

## Formato de cada skill

Cada `SKILL.md` tiene:

1. **Frontmatter YAML** con `name` y `description`. La `description` es el mecanismo de disparo: dice QUE hace y CUANDO usarla (incluye frases gatillo en espanol e ingles). Sin ella la skill no se activa de forma confiable.
2. **Cuerpo** con: cuando usar, documentacion obligatoria, ubicacion en el repo, flujo paso a paso, esqueleto de referencia, checklist de terminado y anti-patrones. Las skills de revision traen checklist priorizada y senales de rechazo.

## Reglas transversales

- Leer la documentacion indicada antes de modificar.
- Mantener cambios dentro de los archivos permitidos; no tocar modulos no relacionados.
- Nombres oficiales de carpetas: `apps/web`, `apps/api`, `services/geo-worker` (no crear `frontend/` ni `backend/` en raiz).
- Orden de autorizacion: autenticacion -> membresia -> permiso (`recurso.accion`) -> alcance -> auditoria.
- `organization_id` se resuelve de la sesion, nunca del body como autoridad.
- Agregar pruebas segun riesgo (incluir acceso cruzado entre organizaciones cuando aplique).
- Actualizar docs o ADR cuando cambie una decision.

## Catalogo

| Area | Skills |
| --- | --- |
| backend | create-module, create-endpoint, create-use-case, add-permission, add-tenant-filter, review-backend |
| devops | add-docker-service, add-environment-variable, add-nginx-route |
| frontend | create-page, create-feature, create-form, create-data-table, create-map-layer, review-frontend |
| geo | process-index, clip-raster, zonal-statistics, validate-geometry, review-geo-job |
| review | security-review, tenancy-review, architecture-review |
| testing | unit-tests, integration-tests, e2e-tests |
| ui-ux | dashboard, empty-state, loading-state, permissions-matrix, accessibility-review |

## Skills externas

Ver `docs/skills-installation.md` para descargar skills externas desde Git de forma controlada.


