---
name: add-tenant-filter
description: Aplica o corrige el filtro multiempresa (organization_id) en un metodo de acceso a datos, validando los IDs recibidos contra la organizacion activa y respetando el alcance. Usa esta skill SIEMPRE que una consulta, repositorio, query o listado pueda estar leyendo o escribiendo sin filtro de tenant, o cuando digan 'falta el tenant', 'filtrar por organizacion', 'tenant filter', 'aislamiento multiempresa' o 'cross-tenant'. Critica para prevenir acceso cruzado entre organizaciones.
---

# Agregar filtro tenant

## Cuando usar
Cualquier lectura/escritura de una entidad de cliente que aun no filtra por organizacion activa, o una revision donde sospechas fuga entre organizaciones.

## Documentacion obligatoria (leer antes)
- `docs/08-security/tenancy.md`
- `docs/02-domain/tenant-model.md`
- El repositorio/metodo de acceso a datos afectado.

## Reglas
- Toda entidad de cliente incluye `organization_id`; toda consulta filtra por la organizacion activa.
- El alcance efectivo se aplica DESPUES del permiso (fundo/parcela/area/recurso asignado).
- Validar todo ID recibido contra la organizacion activa antes de usarlo (evita IDOR).
- `organization_id` viene de la sesion, nunca del body como autoridad.

## Patron de referencia
```ts
// Lectura
findInScope(ctx: SessionContext, id: string) {
  return this.prisma.<recurso>.findFirst({
    where: {
      id,
      organizationId: ctx.activeOrganizationId,   // tenant
      deletedAt: null,
      ...applyScope(ctx.scope),                    // alcance efectivo
    },
  });
}
```

## Checklist antes de terminar
- [ ] `organization_id` presente en TODA consulta de la entidad.
- [ ] IDs entrantes validados contra la organizacion activa.
- [ ] Alcance aplicado despues del permiso.
- [ ] Baja logica (`deleted_at`) respetada.
- [ ] Prueba: usuario de otra organizacion no obtiene el registro.

## Anti-patrones
- `findUnique({ where: { id } })` sin tenant.
- Confiar en que el frontend ya filtro.
- Exponer conteos/totales que revelen datos de otras organizaciones.


