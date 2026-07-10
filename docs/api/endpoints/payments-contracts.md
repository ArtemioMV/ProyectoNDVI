# Endpoints de mensualidades, pagos y documentos

Todas las rutas viven bajo `/api/v1`.

## Historial del cliente

### GET `/clientes/:customerId/historial-pagos`

Devuelve cliente, deuda total, mensualidades, pagos parciales y tickets asociados.

## Mensualidades

### POST `/clientes/:customerId/mensualidades/generar`

Genera mensualidades para todos los servicios activos del cliente.

Body:

```json
{ "period": "2026-07", "dueDate": "2026-07-31T00:00:00.000Z", "notes": "Opcional" }
```

Reglas:

- No duplica mensualidades por servicio y periodo.
- Usa el precio mensual vigente del plan.

## Pagos

### POST `/pagos`

Registra pago parcial o total.

Body:

```json
{ "monthlyFeeId": "uuid", "amount": 50, "method": "CASH", "notes": "Opcional" }
```

Reglas:

- Requiere caja abierta.
- No permite pago mayor al saldo.
- Actualiza monto pagado, saldo y estado en transaccion.
- Genera ticket unico.
- Genera movimiento de caja `INCOME` con fuente `PAYMENT`.

### GET `/pagos/:paymentId/ticket`

Devuelve el ticket de pago imprimible.

## Contrato

### GET `/clientes/:customerId/contrato`

Genera contrato simple con datos del cliente, servicios activos y clausulas base.

## Anulacion de pagos

### PATCH `/pagos/:paymentId/anular`

Anula un pago registrado y devuelve el ticket actualizado.

Body opcional:

```json
{ "reason": "Pago registrado por error" }
```

Reglas:

- Requiere caja abierta.
- Marca el pago como `VOID`.
- Recalcula `paidAmount`, `balance` y estado de la mensualidad.
- Genera movimiento de caja `EXPENSE` con fuente `PAYMENT` para revertir el ingreso.
- No permite anular dos veces el mismo pago.
