# Correcciones y observaciones â€” AGRO_GEOSPATIAL_SAAS_MASTER v0.4

**Estado:** revisiÃ³n completa del documento maestro (90 secciones) + Ã¡rbol `docs/`, scaffold (`apps/`, `services/`, `packages/`, `infrastructure/`) y skills.
**PropÃ³sito:** lista accionable de lo que debe corregirse **antes de escribir cÃ³digo de dominio**. Cada punto indica el problema, dÃ³nde estÃ¡ y la acciÃ³n requerida.
**Prioridad:** los bloqueantes (B) se resuelven primero; las mejoras (M) se anotan pero no frenan la Fase 0.

---

## Resumen de una lÃ­nea

El documento es una base sÃ³lida y por encima del promedio para **guiar** el proyecto. No estÃ¡ listo para **levantar** cÃ³digo de features tal cual: primero hay que cerrar 4 bloqueantes (nombre canÃ³nico, ERD/Prisma, RLS, recorte de MVP) y reconciliar los docs a v0.4.

---

## Bloqueantes (resolver antes de codear dominio)

### B1. ContradicciÃ³n `lote` vs `parcela` â€” la mÃ¡s grave

**Problema.** El v0.4 (Â§63, Â§78, Â§89) canoniza `parcel` + `cultivable_area` y retira `subparcela`. Pero conviven en el repo referencias a `lot`:

- Scaffold: `apps/api/src/modules/lots/`, `apps/web/src/features/lots/`.
- Docs viejos: `docs/02-domain/farms-lots.md`, `docs/03-database/erd.md`.
- Entidades del Â§14: `lots`, `lot_geometries`, `lot_cycles`, `lot_index_results`, `lot_index_statistics`.
- Claves de permiso: `lots.geometry.update`, `lots.read`.
- Las skills generadas (`create-map-layer`, `add-permission`, etc.) usan `lot`.

El propio Â§78.3 admite que **no estÃ¡ resuelto** si `lote` y `parcela` son la misma unidad fÃ­sica.

**AcciÃ³n requerida.**
1. Crear un ADR (`docs/01-architecture/decisions/ADR-011-canonical-parcel-vs-lot.md`) que fije el nombre **canÃ³nico interno** de la unidad fÃ­sica: `parcel` (recomendado por v0.4) o `lot`.
2. La etiqueta visible (`Lote`, `Parcela`, `Cuartel`, `Bloque`) queda configurable por organizaciÃ³n (Â§63.3), separada del nombre interno.
3. Propagar el nombre canÃ³nico a: carpetas del scaffold, entidades/tablas, claves de permiso, contratos (`packages/contracts`), docs y skills.

**Bloquea a:** ERD, seed de permisos, todas las skills de dominio, contratos de API.

---

### B2. El ERD no existe como algo construible

**Problema.** `apps/api/prisma/schema.prisma` estÃ¡ vacÃ­o (solo comentario). `docs/03-database/erd.md` dice "pendiente de modelado formal". Los Â§14 / Â§63 / Â§64 dan campos recomendados, no un esquema real.

**AcciÃ³n requerida.**
1. Formalizar el ERD en `docs/03-database/erd.md` a partir del Â§14 + modelo canÃ³nico Â§63â€“Â§65, ya con el nombre de B1.
2. Traducirlo a `schema.prisma` (PostgreSQL + PostGIS, MultiPolygon/SRID 4326, `organization_id` en toda entidad de cliente, timestamps `created_at/updated_at/deleted_at`, baja lÃ³gica).
3. Primera migraciÃ³n + seed de permisos.

**Convenciones a respetar** (`docs/03-database/naming.md`, `03-database/spatial-model.md`): tablas plural snake_case, columnas snake_case, PK `id` (UUID opaco), historial de geometrÃ­a, no derivar campaÃ±a por aÃ±o (Â§65.4).

**Bloquea a:** Fase 0 funcional, cualquier mÃ³dulo backend.

---

### B3. RLS: decidir ahora, no dejarlo como "posible"

**Problema.** El Â§24 lista **fuga entre organizaciones** como riesgo #1 y menciona RLS de Postgres solo como "posible". Hoy el aislamiento depende Ãºnicamente de que cada repositorio filtre por `organization_id` (capa de app).

**AcciÃ³n requerida.** Crear `ADR-012-tenant-isolation-strategy.md` que decida:
- Aislamiento solo en capa de aplicaciÃ³n, **o**
- Defensa en profundidad: capa de app **+** Row-Level Security en Postgres por `organization_id`.

RecomendaciÃ³n: RLS como seguro contra el peor incidente posible. Es un ADR corto que evita el mayor riesgo del proyecto.

---

### B4. El alcance es demasiado grande para un MVP

**Problema.** Con v0.3/v0.4 se acumularon mÃ³dulos que son productos por sÃ­ mismos: motor configurable de campos/contadores (Â§42: `cap/wrap/carry/reject/confirm`, niveles en cascada, deshacer), evaluaciones configurables, proyecciones semanales versionadas, poda con pasadas/cohortes, clima, riesgo sanitario, zonificaciÃ³n, escenarios econÃ³micos. Intentar construirlo todo = no salir nunca.

**AcciÃ³n requerida.** Declarar explÃ­citamente el **MVP delgado** y diferir el resto:

- **MVP (construir):** identidad + multiempresa + roles/permisos/alcances + parcela/Ã¡rea cultivable + polÃ­gono (dibujo/validaciÃ³n/historial) + solicitud NDVI + resultado + auditorÃ­a.
- **Diferido explÃ­cito (post-MVP):** motor de contadores (Â§42), evaluaciones configurables (Â§40â€“Â§60), proyecciones (Â§66â€“Â§70, Â§80), poda (Â§71â€“Â§76, Â§81), clima (Â§29), sanidad (Â§33), zonificaciÃ³n (Â§31), escenarios econÃ³micos (Â§32).

Registrar la lÃ­nea de corte en `docs/00-vision/scope.md`.

---

## Mejoras (no bloquean, anotar)

### M1. RelaciÃ³n con la base Camposol legacy

El Â§78 tiene buena estrategia de migraciÃ³n (conservar â†’ mapear `subparcela`â†’`cultivable_area` â†’ vista de compatibilidad â†’ validar â†’ retirar) y encaja con el trabajo previo (`subparcela_campaÃ±a`, `area_cultivable`). **Falta declarar** si el sistema nuevo **importa** los datos legacy o corre en paralelo. Convertir el Â§78.4 de "decisiÃ³n pendiente controlada" a decisiÃ³n con fecha.

### M2. PatrÃ³n Ãºnico de versionamiento

Proyecciones, plantillas, roles, geometrÃ­as y Ã¡rea cultivable son todos "no sobrescribir, versionar". Definir **un** patrÃ³n reutilizable (estado + nÃºmero de versiÃ³n + rango de vigencia) en `docs/03-database/` y aplicarlo en todos, en vez de reinventarlo por mÃ³dulo.

### M3. CatÃ¡logo de permisos disperso

Las claves de permiso estÃ¡n repartidas en Â§6.3, Â§6.4, Â§36, Â§54, Â§82 y **no coinciden** con `docs/08-security/permissions.md`. Consolidar en un Ãºnico catÃ¡logo autoritativo + seed antes de tocar RBAC, con el nombre canÃ³nico de B1.

### M4. Higiene documental (fuente de verdad activa)

6.518 lÃ­neas en un archivo con polÃ­tica de "no pÃ©rdida" es buen histÃ³rico pero las secciones viejas (`lot`) conviven fÃ­sicamente con las nuevas (`parcel`); un agente puede seguir la equivocada. **Mantener el master como historia**, pero declarar que la fuente de verdad **activa** para agentes es el Ã¡rbol `docs/` partido, reconciliado a v0.4.

### M5. Estrategia de IDs

UUID opaco (Â§14.3) es correcto. Si habrÃ¡ joins geoespaciales pesados, considerar UUIDv7/ULID por localidad de Ã­ndice.

### M6. Skills: renombrar tras B1

Las 31 skills siguen el formato del Â§13.4 pero mÃ¡s profundas. En cuanto se fije el nombre canÃ³nico (B1), renombrar las que usan `lots`/`lot` y ajustar el scaffold (`modules/lots`, `features/lots`). Sin B1 resuelto, no tocar.

---

## Orden recomendado de ejecuciÃ³n

1. **B1** â€” ADR nombre canÃ³nico (parcela/lote).
2. **B3** â€” ADR aislamiento tenant (RLS sÃ­/no).
3. **B2** â€” ERD â†’ `schema.prisma` â†’ migraciÃ³n + seed de permisos.
4. **B4** â€” recortar y documentar el MVP en `scope.md`.
5. **M3, M4** â€” consolidar catÃ¡logo de permisos y reconciliar `docs/` a v0.4.
6. Renombrar skills/scaffold (**M6**).
7. ReciÃ©n entonces: **Fase 0** (bootstrap monolito, Docker local, auth skeleton).

---

## Lo que NO hay que cambiar (ya estÃ¡ bien)

- Las 30 decisiones del Â§23 (stack y arquitectura) son coherentes; no reabrir.
- Regla de repo "cada cosa en su contexto" y ubicaciÃ³n de Tailwind en `apps/web`.
- Monolito modular en vez de microservicios (Â§25).
- Adaptadores de proveedor satelital + objetos grandes en MinIO/S3, metadatos en Postgres.
- Orden de autorizaciÃ³n: autenticaciÃ³n â†’ membresÃ­a â†’ permiso â†’ alcance â†’ auditorÃ­a.
- `organization_id` desde la sesiÃ³n, nunca desde el body.

