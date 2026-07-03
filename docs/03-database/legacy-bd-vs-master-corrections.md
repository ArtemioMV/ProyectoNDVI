# Correcciones â€” BD guÃ­a (`BD_ESTRUCTURA_FINAL_LIMPIA.sql`) vs Master v0.4

**Contexto:** se propone usar esta BD "para que guÃ­e" el proyecto.
**RevisiÃ³n:** 23 tablas, FKs, Ã­ndices y el hÃ­brido JSONB de `registro`, contrastadas contra las decisiones aprobadas del documento maestro v0.4.
**Veredicto:** esta BD y el master v0.4 **describen dos sistemas distintos**. La BD es el modelo **actual/legacy** (estilo Camposol): single-tenant, sin geometrÃ­a, RBAC por mÃ³dulo. El master es el **destino**: SaaS multiempresa geoespacial con RBAC `recurso.accion`. **No puede haber dos fuentes de verdad guiando el build.**

---

## 1. Contradicciones nÃºcleo (la BD va contra el master v0.4)

| # | Tema | BD guÃ­a (actual) | Master v0.4 (aprobado) | Choque |
|---|------|------------------|------------------------|--------|
| 1 | JerarquÃ­a fÃ­sica | `fundo â†’ parcela â†’ subparcela â†’ lote â†’ sublote` (lote cuelga de subparcela) | `Fundo â†’ Parcela â†’ Ãrea cultivable`; **retirar subparcela** (Â§63, Â§78, Â§89.1) | La BD es la estructura de la que el Â§78 querÃ­a **migrar**, no la de destino |
| 2 | Multiempresa | **No existe** `organization` ni `organization_id`; `usuario` con un solo `id_rol` global | SaaS multiempresa desde el diseÃ±o; `organization_id` obligatorio (Â§3.4, Â§5) | La BD es **single-tenant**; contradice el pilar #1 y el riesgo #1 (fuga entre clientes) |
| 3 | GeometrÃ­a | Sin PostGIS; `fundo/parcela/lote` solo con `area_hectareas numeric` | PolÃ­gonos por unidad, PostGIS, MultiPolygon/SRID 4326, historial de geometrÃ­a (Â§7, Â§14) | La BD **no tiene nada geoespacial** |
| 4 | RBAC | `permiso_rol_modulo` = rol Ã— mÃ³dulo con CRUD booleano | `recurso.accion` + alcances por org/fundo/lote + overrides por usuario (Â§6) | Modelos de granularidad **incompatibles** |
| 5 | Identificadores | `serial/smallserial` (enteros secuenciales) | UUID opaco; no exponer secuenciales (Â§14.3) | Contradice anti-enumeraciÃ³n |
| 6 | Convenciones | EspaÃ±ol + `activo boolean` + `creado_en/actualizado_en` | InglÃ©s + `deleted_at` + `created_at/updated_at` (`farm`, `parcel`, `organization_id`) | ConvenciÃ³n de nombres cruzada |
| 7 | AuditorÃ­a | `registro_audit` solo para `registro` (evaluaciones) | `audit_logs` global para acciones sensibles del sistema (Â§16.4) | Cobertura de auditorÃ­a parcial |
| 8 | Secretos | `integracion_api` guarda `api_key`/`secreto` en texto plano | No commitear/almacenar secretos en claro (Â§16.3) | Riesgo de fuga de secretos |

---

## 2. Lo que la BD SÃ aporta y hay que conservar

El **motor de evaluaciones configurables** es una implementaciÃ³n real y limpia del Â§40 del master:

```
tipo_evaluacion â†’ evaluacion â†’ evaluacion_cultivo â†’ campo_evaluacion (campos dinÃ¡micos)
                                                   â†“
              registro (hÃ­brido: metadata + datos_evaluacion JSONB) â†’ estado_registro â†’ registro_audit
```

- `campo_evaluacion` ya modela campos dinÃ¡micos (tipo_dato, min/max, `opciones_select` JSONB, regex, orden, obligatorio).
- `registro.datos_evaluacion jsonb` es el patrÃ³n hÃ­brido correcto para cartillas variables.
- Estados de registro (`borrador/enviado/validado/rechazado`) y auditorÃ­a por registro ya existen.

**Nota de alcance:** esto cubre un **subconjunto** del Â§40. El motor de contadores del Â§42 (`cap/wrap/carry/reject/confirm`, contadores en cascada, deshacer) **no estÃ¡** en esta BD. Es evoluciÃ³n posterior, no MVP.

---

## 3. DecisiÃ³n requerida (una de dos)

- **(A) â€” RECOMENDADA.** El master v0.4 es el **destino**; esta BD es el **origen legacy a migrar** (Â§78) y la fuente del mÃ³dulo de evaluaciones.
- **(B).** Esta BD es el punto de partida real â†’ habrÃ­a que reescribir Â§5, Â§7, Â§63 y Â§78 del master para renunciar a multiempresa y geoespacial. **No recomendada:** se pierden los dos diferenciadores del producto.

El resto de este documento asume **(A)**.

---

## 4. Mapeo legacy â†’ canÃ³nico

**Leyenda:** CONSERVAR (adaptar y quedarse) Â· RENOMBRAR Â· RETIRAR (Â§78) Â· REEMPLAZAR (rehacer con otro modelo) Â· DECISIÃ“N (requiere inventario del Â§78.4).

| Tabla legacy | AcciÃ³n | Destino canÃ³nico | Notas |
|---|---|---|---|
| `pais` | RENOMBRAR | `country` | CatÃ¡logo global |
| `cultivo` | RENOMBRAR | `crop` | CatÃ¡logo |
| `variedad` | RENOMBRAR | `variety` | CatÃ¡logo |
| `fundo` | CONSERVAR | `farm` | **+`organization_id`**, geometrÃ­a opcional |
| `parcela` | CONSERVAR | `parcel` (unidad fÃ­sica canÃ³nica) | **+`organization_id`**, **+polÃ­gono** (MultiPolygon/4326), **+historial de geometrÃ­a** |
| `subparcela` | RETIRAR | â€” | Su funciÃ³n (parcela+variedad) la cubre `cultivable_area` (Â§89.1). Migrar con vista de compatibilidad |
| `lote` | DECISIÃ“N | Â¿`parcel` (fusiÃ³n) o subdivisiÃ³n opcional? | Â§78.4: inventariar registros/geometrÃ­as/uso antes de fusionar o conservar |
| `sublote` | DECISIÃ“N | probable RETIRO | Evaluar junto con `lote`; subdivisiÃ³n de subdivisiÃ³n |
| `campania` | CONSERVAR | `campaign` | **+`organization_id`**; no derivar por aÃ±o (Â§65.4) |
| `cultivo_lote_campania` (CLC) | REEMPLAZAR | vÃ­nculo dentro de `cultivable_area` | Legacy: campaÃ±a+lote(+sublote). CanÃ³nico: el vÃ­nculo va **parcela+campaÃ±a** |
| `area_cultivable` | CONSERVAR (enriquecer) | `cultivable_area` | Hoy = CLCÃ—variedad. CanÃ³nico = parcela+campaÃ±a+variedad **+Ã¡rea, plantas, densidad, estado, geometrÃ­a opcional, historial** (Â§64) |
| `rol` | CONSERVAR (reencuadrar) | `role` **por organizaciÃ³n** | Roles dejan de ser globales |
| `usuario` | REEMPLAZAR (split) | `user` (global, email Ãºnico) **+** `organization_membership` | El `id_rol` Ãºnico se mueve a `membership_roles` |
| `usuario_cultivo` | REEMPLAZAR | `access_scope` (alcance por cultivo) | Se integra al modelo de alcances (Â§6.5) |
| `permiso_rol_modulo` | REEMPLAZAR | `permissions` (`recurso.accion`) + `role_permissions` + `membership_permission_overrides` | RBAC fino con alcances; adiÃ³s CRUD por mÃ³dulo |
| `tipo_evaluacion` | CONSERVAR | `evaluation_type` | MÃ³dulo evaluaciones Â§40 |
| `evaluacion` | CONSERVAR | `evaluation` | |
| `evaluacion_cultivo` | CONSERVAR | `evaluation_crop` | |
| `campo_evaluacion` | CONSERVAR | `evaluation_field` | Campos dinÃ¡micos |
| `estado_registro` | CONSERVAR | `record_status` | |
| `registro` | CONSERVAR (enriquecer) | `evaluation_record` | **+`organization_id` denormalizado** para filtro de tenant/RLS; ya liga a `cultivable_area` |
| `registro_audit` | CONSERVAR | `evaluation_record_audit` | Complementar con `audit_logs` global |
| `integracion_api` | CONSERVAR (endurecer) | `integration` | Mover `api_key`/`secreto` a gestor de secretos / cifrado; no texto plano |

---

## 5. Entidades que faltan (agregar, no existen en la BD)

**Multiempresa e identidad:** `organizations`, `organization_memberships`, `membership_roles`, `membership_permission_overrides`, `access_scopes`, `sessions`, `invitations`.

**RBAC:** `permissions` (`recurso.accion`), `role_permissions`.

**Geoespacial (PostGIS):** columnas `geometry(MultiPolygon,4326)` en `parcel` (y `cultivable_area` opcional), tabla de historial `parcel_geometries`.

**SatÃ©lite:** `satellite_sources`, `satellite_scenes`, `processing_jobs`, `processing_job_events`, `vegetation_indices`, `parcel_index_results`, `parcel_index_statistics`.

**Transversal:** `stored_objects` (refs MinIO/S3), `audit_logs` global, `alerts`.

**En toda entidad de cliente:** `organization_id` + `created_at/updated_at/deleted_at`.

---

## 6. ReconciliaciÃ³n de convenciones (definir en un ADR)

1. **Idioma de esquema.** El master/docs usan inglÃ©s (`farm`, `parcel`, `organization_id`). La BD usa espaÃ±ol. Elegir uno y aplicarlo a todo (`docs/03-database/naming.md`). Recomendado: inglÃ©s interno.
2. **IDs.** `serial` â†’ UUID opaco (o UUIDv7/ULID por localidad de Ã­ndice).
3. **Baja lÃ³gica.** `activo boolean` â†’ `deleted_at timestamp` (convenciÃ³n del proyecto).
4. **Timestamps.** `creado_en/actualizado_en` â†’ `created_at/updated_at`.
5. **Tenant.** `organization_id` en toda entidad de cliente; denormalizarlo en `evaluation_record` para RLS/filtrado eficiente.

---

## 7. Estrategia de migraciÃ³n (alineada al Â§78)

1. Conservar la BD legacy intacta como origen (no sobrescribir â€” Â§89.21).
2. Levantar el esquema canÃ³nico nuevo (parcela/Ã¡rea cultivable/multiempresa/PostGIS/RBAC).
3. Inventario del Â§78.4 para decidir `lote`/`parcela`/`sublote` (registros, geometrÃ­as, cÃ³digos, uso, integraciones).
4. Mapear datos: `subparcela`â†’retiro vÃ­a `cultivable_area`; `area_cultivable(CLCÃ—variedad)`â†’`cultivable_area(parcel+campaign+variety)`.
5. Vista de compatibilidad `legacy_subparcela_view` durante la transiciÃ³n (no como fuente de verdad).
6. Conservar y adaptar el mÃ³dulo de evaluaciones (agregar `organization_id`).
7. Validar (comparar resultados legacy vs nuevo) antes de retirar cualquier tabla.

---

## 8. Resumen ejecutivo

- Esta BD **no** debe usarse como guÃ­a tal cual: contradice multiempresa, geoespacial, RBAC fino, UUID y convenciones del master v0.4.
- Ãšsala como **origen legacy** (Â§78) + **fuente del mÃ³dulo de evaluaciones** (Â§40), que sÃ­ es reutilizable.
- El master v0.4 sigue siendo el **destino**.
- Dependencia con las correcciones previas: esto concreta **B1** (lote vs parcela) y **M1** (relaciÃ³n legacy) del documento `CORRECCIONES_MASTER_v0_4.md`.

