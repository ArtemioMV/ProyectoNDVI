# Migraciones de base de datos

## Inventario, compras y venta de materiales

Cambio pendiente de migracion Prisma real cuando exista `DATABASE_URL` de desarrollo.

Modelos y enums agregados al schema:

- `Material`
- `MaterialMovement`
- `MaterialSale`
- `MaterialSaleItem`
- `MaterialSaleStatus`
- `Supplier` (datos comerciales, contacto y ubicacion)
- `MaterialPurchase`
- `MaterialPurchaseItem`
- `PurchaseStatus`
- `ExpenseCategory`
- `Expense`
- `ExpenseCategoryType`
- `ExpenseStatus`
- `InventoryMovementType`

Motivo:

- Soportar fase 3: inventario simple, movimientos de stock, compra de materiales y venta de materiales.
- Absorber las hojas del Excel de control financiero: venta de materiales, compra de materiales, gastos/conceptos y caja.

Impacto en datos:

- No requiere backfill en bases nuevas.
- En una base existente, crear tablas nuevas e insertar seeds idempotentes de permisos y materiales base.

Reglas criticas:

- Compra con `materialId` incrementa stock y crea movimiento `PURCHASE`.
- Compra con `paidFromCash` exige caja abierta y crea movimiento de caja `PURCHASE` como egreso.
- Venta exige caja abierta, descuenta stock, crea movimiento `SALE` y crea ingreso de caja.
- Conceptos libres de compra no mueven stock.
- Gastos operativos no mueven stock y pueden crear egreso de caja `EXPENSE`.
- Importes con `Decimal`.
- Operaciones en transaccion.

Validacion realizada:

- `prisma generate`
- `prisma validate` con `DATABASE_URL` temporal.

## Mensualidades y pagos

Cambio pendiente de migracion Prisma real cuando exista `DATABASE_URL` de desarrollo.

Modelos y enums agregados:

- `MonthlyFee`
- `Payment`
- `MonthlyFeeStatus`
- `PaymentMethod`
- `PaymentStatus`

Motivo:

- Soportar historial de pagos por cliente, pagos parciales, ticket de pago y contrato simple.

Impacto en datos:

- En bases nuevas no requiere backfill.
- En bases existentes crear tablas nuevas e insertar permisos idempotentes.

Reglas criticas:

- `MonthlyFee` es unico por `serviceId + period`.
- Importes con `Decimal`.
- Registro de pago en transaccion.
- El pago exige caja abierta y crea movimiento de caja `PAYMENT`.

## Caja

Cambio pendiente de migracion Prisma real cuando exista `DATABASE_URL` de desarrollo.

Modelos y enums agregados:

- `CashRegister`
- `CashMovement`
- `CashRegisterStatus`
- `CashMovementType`
- `CashMovementSource` (`PAYMENT`, `SALE`, `PURCHASE`, `EXPENSE`, `MANUAL`)

Motivo:

- Controlar apertura, movimientos, cierre y diferencia de caja.
- Integrar pagos, compras y ventas con caja antes de permitir operaciones financieras.

Impacto en datos:

- En bases nuevas no requiere backfill.
- En bases existentes crear tablas nuevas e insertar permisos idempotentes de caja.

Reglas criticas:

- Solo una caja abierta por operacion de negocio.
- `expectedAmount` se actualiza por movimientos en transaccion.
- El cierre calcula `difference` contra monto contado.


