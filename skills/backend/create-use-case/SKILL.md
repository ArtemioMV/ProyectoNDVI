---
name: create-use-case
description: Crea un caso de uso (regla de negocio) en apps/api desacoplado de HTTP, que recibe contexto autenticado y valida permiso y alcance antes de modificar datos. Usa esta skill cuando se pida implementar logica de negocio, una regla de dominio, un servicio de aplicacion o un 'use case'/'caso de uso' en el backend, o al separar logica que hoy vive en un controller. Para exponerlo por HTTP usa create-endpoint.
---

# Crear caso de uso (backend)

## Cuando usar
Encapsular una regla de negocio del backend independiente de la capa HTTP. Es la capa intermedia entre controller y repositorio.

## Documentacion obligatoria (leer antes)
- El modulo backend relacionado en `apps/api/src/modules/<modulo>`.
- `docs/08-security/tenancy.md`
- `docs/04-api/authorization.md`

## Principios
- Sin `Request`/`Response` ni decoradores HTTP dentro del use-case.
- Recibe un `SessionContext` (usuario, organizacion activa, membresia, permisos, alcances).
- Valida permiso y alcance antes de cualquier escritura.
- Devuelve datos/errores de dominio; el mapeo a HTTP lo hace el controller.

## Ubicacion
`apps/api/src/modules/<modulo>/use-cases/<accion>.use-case.ts`

## Esqueleto de referencia
```ts
export class Update<Recurso>UseCase {
  constructor(
    private readonly repo: <Recurso>Repository,
    private readonly authz: AuthorizationService,
    private readonly audit: AuditService,
  ) {}

  async execute(ctx: SessionContext, input: Update<Recurso>Input) {
    this.authz.require(ctx, '<recurso>.update');
    const current = await this.repo.findInScope(ctx, input.id);   // valida tenant + scope
    if (!current) throw new NotFoundDomainError('<recurso>');
    const updated = await this.repo.update(ctx, input);
    await this.audit.record(ctx, '<recurso>.update', { id: input.id });
    return updated;
  }
}
```

## Checklist antes de terminar
- [ ] No importa nada de `@nestjs/common` relacionado a HTTP.
- [ ] Valida permiso y alcance antes de modificar.
- [ ] Toda lectura/escritura pasa por el repositorio con tenant.
- [ ] Pruebas unitarias de la regla y de sus casos borde.

## Anti-patrones
- Recibir `organization_id` por parametro suelto en vez de tomarlo del contexto.
- Mezclar validacion HTTP con reglas de negocio.


