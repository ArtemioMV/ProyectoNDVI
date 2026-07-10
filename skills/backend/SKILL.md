---
name: backend
description: Como trabajar el backend NestJS del sistema IPTV/Internet: estructura de modulos, controladores delgados, casos de uso, servicios, DTO con validacion, manejo de errores con codigo, auditoria, transacciones para dinero, convenciones de endpoints, Swagger e integraciones desacopladas. Usa esta skill al crear o modificar cualquier modulo, endpoint o regla de negocio en apps/backend. Se dispara con 'backend', 'NestJS', 'endpoint', 'modulo', 'controlador', 'servicio', 'caso de uso', 'DTO', 'Swagger', 'API'.
---

# Skill de backend

Cómo se trabaja el backend en `apps/backend` (NestJS + Prisma + PostgreSQL + Redis + Swagger).

## Estructura de un módulo
`src/modules/<modulo>/`:
```
<modulo>.module.ts
<modulo>.controller.ts     # solo HTTP: valida, delega, mapea
<modulo>.service.ts        # orquesta el caso de uso
dto/  entities/  repositories/  use-cases/  policies/  tests/
```
Infra transversal reusa `src/common/{decorators,guards,interceptors,filters,pipes,exceptions,utils}` y `src/infrastructure/{prisma,redis,mail,whatsapp,dni,maps}` (no reimplementar).

## Reglas por capa
- Controlador: sin lógica compleja; recibe DTO, delega, devuelve respuesta estándar.
- Caso de uso / servicio: reglas de negocio; aquí van transacciones y auditoría.
- Repositorio: acceso a datos vía Prisma.
- Policies: reglas de autorización/propiedad del recurso.

## Validación
- Todo input pasa por un DTO con `class-validator` / `class-transformer`. `ValidationPipe` global con `whitelist: true`.

## Respuesta y errores (formato obligatorio)
```json
// éxito
{ "success": true, "data": {}, "message": "Operación completada" }
// error
{ "success": false, "error": { "code": "CLIENT_NOT_FOUND", "message": "El cliente no existe", "details": null } }
```
Un filtro de excepciones mapea errores de dominio a este formato con `code` estable. Nunca exponer stack/SQL.

## Convenciones de endpoints
- Sustantivos en plural, API versionada (`/api/v1/...`).
- Paginación: `?page&limit&search&sortBy&sortOrder`, orden estable.
- No devolver datos sensibles. Swagger actualizado por endpoint (tags, respuestas, DTOs).

## Transacciones y auditoría
- Toda operación financiera (pagos, mensualidades, caja, ventas/compras) en `prisma.$transaction`.
- Acciones sensibles (anular pago, reabrir caja, ajustar inventario, cancelar servicio) generan registro de auditoría (actor, acción, entidad, motivo).

## Integraciones
- Desacopladas en `infrastructure/{dni,whatsapp,mail,maps}` con adaptador por proveedor (ver skill de integraciones). Credenciales solo en backend.

## Checklist
- [ ] Controlador sin lógica; DTO validando entrada.
- [ ] Respuesta/errores en el formato estándar con `code`.
- [ ] Transacción en toda operación de dinero.
- [ ] Auditoría en acciones sensibles.
- [ ] Endpoint plural, versionado, paginado y en Swagger.

## Anti-patrones
- Reglas de negocio en el controlador.
- Operación financiera sin transacción.
- Exponer errores internos o datos sensibles.
