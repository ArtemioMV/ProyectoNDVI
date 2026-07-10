# Endpoints de cobranza

Todas las rutas viven bajo `/api/v1`.

## GET `/cobranza`

Devuelve resumen global y lista de mensualidades para cobro.

Query params opcionales:

- `search`: nombre, documento o telefono del cliente.
- `status`: `PENDING`, `PARTIAL`, `PAID` o `VOID`.
- `dateFrom`: fecha inicial `YYYY-MM-DD` para vencimiento.
- `dateTo`: fecha final `YYYY-MM-DD` para vencimiento.

Respuesta:

- `summary.totalPending`
- `summary.pendingCount`
- `summary.overdueCount`
- `summary.partialCount`
- `summary.paidThisMonth`
- `items[]`: mensualidad, cliente, servicio, saldo y ultimo pago.


