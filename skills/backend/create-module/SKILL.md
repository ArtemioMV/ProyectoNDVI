---
name: create-module
description: Crea un modulo NestJS nuevo en apps/api/src/modules con tenant, permisos, alcances y auditoria desde el inicio. Usa esta skill SIEMPRE que se pida crear un modulo, recurso o dominio nuevo en el backend/API (por ejemplo modulos de farms, parcels, satellite, alerts, campaigns), o cuando alguien diga 'nuevo modulo', 'nuevo recurso', 'nuevo dominio backend', 'create module' o 'add resource'. No la uses para agregar solo un endpoint a un modulo existente (usa create-endpoint) ni para logica de negocio pura (usa create-use-case).
---

# Crear modulo backend (NestJS)

## Cuando usar
Crear un dominio/recurso nuevo en `apps/api` (ej. `campaigns`, `alerts`). Si el modulo ya existe y solo agregas una operacion, usa **create-endpoint**.

## Documentacion obligatoria (leer antes)
- `docs/01-architecture/component-diagram.md`
- `docs/01-architecture/frontend-backend-boundaries.md`
- `docs/04-api/conventions.md`
- `docs/08-security/tenancy.md`
- `docs/08-security/permissions.md`

## Ubicacion en el repo
```
apps/api/src/modules/<modulo>/
  <modulo>.module.ts
  controllers/<modulo>.controller.ts     # solo HTTP: valida, delega, mapea
  use-cases/<accion>.use-case.ts         # negocio, sin detalles HTTP
  repositories/<modulo>.repository.ts    # datos, SIEMPRE filtra organization_id
  dto/                                   # entrada validada
  <modulo>.types.ts
apps/api/test/<modulo>/                  # integracion tenant/permiso/scope
```
Infra transversal reusa `apps/api/src/common/{auth,authorization,tenancy,audit,errors,observability}` (no reimplementar).

## Flujo paso a paso
1. Confirmar el recurso y su relacion con `organization_id` y con fundo/parcela/area cultivable (ver `docs/02-domain/farms-parcels.md`).
2. Definir los permisos `recurso.accion` que expondra (ver skill **add-permission**).
3. Crear la carpeta con las 3 capas separadas (controller / use-case / repository).
4. Registrar el modulo en el modulo raiz de la app.
5. Todo repositorio recibe el contexto de sesion y filtra por organizacion activa.
6. Auditar acciones sensibles con `common/audit`.
7. Agregar prueba de acceso cruzado entre organizaciones.

## Esqueleto de referencia
> Ajusta segun tu ADR de modelo de datos (ERD aun pendiente en `docs/03-database/erd.md`).
```ts
// use-cases/list-<modulo>.use-case.ts  â€” negocio puro, sin req/res
export class List<Modulo>UseCase {
  constructor(private readonly repo: <Modulo>Repository) {}
  async execute(ctx: SessionContext, query: List<Modulo>Query) {
    // ctx trae: userId, activeOrganizationId, membershipId, permisos, alcances
    return this.repo.findManyForOrg(ctx.activeOrganizationId, ctx.scope, query);
  }
}
```

## Checklist antes de terminar
- [ ] Controller no contiene logica de negocio.
- [ ] Ningun repositorio consulta sin `organization_id`.
- [ ] `organization_id` se resuelve de la sesion, nunca del body como autoridad.
- [ ] Permisos nuevos documentados en `docs/08-security/permissions.md`.
- [ ] Auditoria en acciones sensibles.
- [ ] Prueba de cruce entre organizaciones incluida.

## Anti-patrones
- Crear carpetas `backend/` o `frontend/` en la raiz. Nombres oficiales: `apps/api`, `apps/web`.
- Meter reglas de negocio en el controller.
- Exponer errores internos, SQL o trazas al cliente.


