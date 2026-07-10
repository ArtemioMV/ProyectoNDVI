---
name: database
description: Convenciones de base de datos con Prisma/PostgreSQL para el sistema IPTV/Internet: nombres de modelos y relaciones, campos obligatorios, created_at/updated_at, estados, eliminacion logica, indices, unicos, migraciones en git, seeds, dinero con Decimal y transacciones. Usa esta skill al crear o modificar schema.prisma, agregar modelos/campos, generar migraciones o seeds. Se dispara con 'base de datos', 'Prisma', 'schema', 'modelo', 'migracion', 'seed', 'tabla', 'Decimal'.
---

# Skill de base de datos

Convenciones para `apps/backend/prisma`.

## Nombres
- Modelos en PascalCase singular (`Cliente`, `ServicioContratado`, `Mensualidad`); `@@map` a tabla snake_case plural.
- Campos y relaciones en snake_case; relaciones nombradas de forma explícita.

## Campos obligatorios de toda entidad
- PK `id` (UUID o autoincrement según decisión de ADR).
- `created_at` (`@default(now())`), `updated_at` (`@updatedAt`).
- Eliminación **lógica**: `deleted_at` o estado de anulación; nunca borrado físico de datos financieros.
- Estados como enum explícito cuando aplique (servicio: ACTIVO/SUSPENDIDO/CANCELADO; mensualidad: PENDIENTE/PARCIAL/PAGADA/ANULADA; caja: ABIERTA/CERRADA).

## Dinero (regla dura)
- Importes con `Decimal` (`@db.Decimal(12,2)`). **Nunca `Float`** para dinero.
- Guardar precio congelado en el contrato/servicio; no depender del precio vivo del plan.

## Índices y únicos
- Índice en toda FK y en columnas de filtro frecuente (cliente, periodo, estado).
- Únicos del negocio: cliente por documento; **mensualidad única por (servicio, periodo)** para que no se dupliquen.

## Migraciones
- `prisma migrate dev --name <verbo_recurso>`; migraciones **versionadas en git**.
- **Nunca `prisma db push` en producción**. No editar migraciones ya aplicadas: crear una nueva.

## Seeds
- `prisma/seed.ts` idempotente (upsert): roles, permisos (`recurso.accion`), unidades de medida, configuración base.

## Transacciones
- Pagos, mensualidades, caja e inventario en `prisma.$transaction` (consistencia de saldos y stock).

## Checklist
- [ ] `created_at`/`updated_at` + eliminación lógica.
- [ ] Dinero en `Decimal`, jamás `Float`.
- [ ] Índices en FKs; único mensualidad (servicio, periodo).
- [ ] Migración versionada; sin `db push` en prod.
- [ ] Seed idempotente.

## Anti-patrones
- `Float` para importes.
- Borrado físico de registros financieros.
- Permitir mensualidades duplicadas por periodo.
