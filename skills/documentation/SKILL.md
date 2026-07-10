---
name: documentation
description: Como mantener la documentacion del sistema IPTV/Internet: que documentos se actualizan por cada cambio, como redactar reglas de negocio, documentar endpoints y decisiones, crear ADR, actualizar diagramas, documentar migraciones y mantener el README. Usa esta skill al cerrar cualquier cambio que afecte comportamiento, contratos, esquema o decisiones. Se dispara con 'documentacion', 'documentar', 'ADR', 'reglas de negocio', 'diagrama', 'README', 'docs'.
---

# Skill de documentación

Qué se actualiza y cómo, en `docs/`. La documentación es parte de la definición de terminado.

## Qué se actualiza por cada cambio
| Cambio | Documento |
|---|---|
| Regla de negocio nueva/modificada | `docs/business-rules/` |
| Endpoint nuevo/cambiado | `docs/api/` + Swagger |
| Cambio de esquema | `docs/database/` + nota de migración |
| Decisión técnica | `docs/decisions/` (ADR) |
| Cambio de arquitectura/flujo | `docs/architecture/` (+ diagrama) |
| Integración | `docs/integrations/` |
| Fase/alcance | `docs/phases/` |

## Cómo redactar reglas de negocio
- Frases cortas y verificables (como las de la sección 17 del plan). Una regla por línea. Sin ambigüedad.
- Ejemplo: "La generación de mensualidades no duplica el periodo".

## Cómo documentar endpoints
- Método, ruta (plural, versionada), permiso requerido, DTO de entrada, forma de respuesta `{success,data,message}`, errores con `code`. Reflejar en Swagger.

## ADR (decisiones)
- Un archivo por decisión en `docs/decisions/ADR-<n>-<tema>.md`: contexto, decisión, alternativas, consecuencias. Al cambiar una decisión, se escribe un ADR nuevo que reemplaza, no se borra el anterior.

## Migraciones
- Cada migración con una nota: qué cambia, por qué, impacto en datos y si requiere backfill.

## Diagramas y README
- Actualizar el diagrama afectado (arquitectura/flujo) cuando cambie el comportamiento.
- README mantiene: cómo levantar el proyecto, comandos, estructura y enlaces a `docs/`.

## Checklist
- [ ] Documento(s) afectado(s) actualizado(s).
- [ ] Endpoint en `docs/api` + Swagger.
- [ ] ADR si hubo decisión.
- [ ] Nota de migración si cambió el esquema.
- [ ] README/diagrama al día.

## Anti-patrones
- Cerrar un cambio sin tocar la documentación.
- Reglas de negocio ambiguas o en párrafos largos.
- Borrar un ADR en vez de reemplazarlo.
