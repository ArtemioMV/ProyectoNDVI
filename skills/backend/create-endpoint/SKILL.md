---
name: create-endpoint
description: Agrega un endpoint REST multiempresa a un modulo NestJS existente aplicando el orden autenticacion -> membresia -> permiso -> alcance -> auditoria. Usa esta skill SIEMPRE que se pida crear, agregar o exponer un endpoint, ruta de API, operacion REST o accion de backend (GET/POST/PATCH/DELETE), o cuando digan 'nuevo endpoint', 'add endpoint', 'nueva ruta de API', 'expose action'. Para un modulo entero nuevo usa create-module; para logica de negocio aislada usa create-use-case.
---

# Crear endpoint multiempresa (NestJS)

## Cuando usar
Exponer una operacion HTTP nueva en un modulo que ya existe en `apps/api/src/modules`.

## Documentacion obligatoria (leer antes)
- `docs/04-api/conventions.md`
- `docs/04-api/authorization.md`
- `docs/04-api/errors.md`
- `docs/04-api/pagination.md` (si es listado)
- `docs/08-security/tenancy.md`
- `docs/08-security/permissions.md`

## Orden obligatorio (no saltarse pasos)
1. Autenticacion (usuario global).
2. Membresia activa en la organizacion.
3. Permiso por accion (`recurso.accion`).
4. Alcance de datos (fundo / parcela / area cultivable / recurso asignado).
5. Auditoria si la accion es sensible.

## Flujo paso a paso
1. Definir metodo + ruta y el permiso que exige.
2. Crear/usar DTO de entrada con validacion.
3. Resolver `organization_id` desde la sesion (NUNCA del body).
4. Delegar a un use-case; el controller solo orquesta HTTP.
5. Devolver error normalizado (codigo estable, mensaje seguro, correlacion) ante fallo.
6. Paginar listados con orden estable y limite maximo.
7. Auditar si aplica.

## Esqueleto de referencia
```ts
// controllers/<modulo>.controller.ts
@Post()
async create(@Session() session: SessionContext, @Body() dto: Create<Recurso>Dto) {
  await this.authz.require(session, '<recurso>.create');   // permiso
  return this.create<Recurso>.execute(session, dto);        // scope se aplica en el use-case/repo
}
```
```ts
// Regla de repositorio (SIEMPRE)
where: { organizationId: session.activeOrganizationId, deletedAt: null, ...scope }
```

## Checklist antes de terminar
- [ ] Valida autenticacion, membresia, permiso y alcance en ese orden.
- [ ] `organization_id` viene de la sesion.
- [ ] Entrada validada con DTO.
- [ ] Errores normalizados, sin filtrar internos.
- [ ] Listados paginados y con orden estable.
- [ ] Prueba: usuario de otra organizacion recibe 403/404 y no ve datos.

## Anti-patrones
- Aceptar `organization_id` del body como autoridad.
- Consultas sin filtro de tenant.
- Logica de negocio en el controller.
- Ejecutar procesamiento geoespacial pesado dentro del request (publica un job, ver **process-index**).


