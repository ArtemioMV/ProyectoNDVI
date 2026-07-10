# Endpoints de gastos

Todas las rutas viven bajo `/api/v1`.

## Categorias

### GET `/gastos/categorias`

Lista categorias de gasto.

### POST `/gastos/categorias`

Crea categoria de gasto.

Body:

```json
{ "name": "Energia electrica", "type": "UTILITY", "description": "Pagos de energia" }
```

## Gastos

### GET `/gastos?period=2026-06`

Lista gastos. Si se envia `period`, filtra por mes.

### POST `/gastos`

Registra un gasto operativo.

Body:

```json
{
  "categoryId": "uuid",
  "description": "PAGO ENERGIA CABECERA",
  "amount": 517.5,
  "paymentMethod": "CASH",
  "paidFromCash": true,
  "reference": "Recibo junio",
  "expenseDate": "2026-06-15T00:00:00.000Z"
}
```

Reglas:

- Requiere categoria activa.
- Si `paidFromCash` es `true`, exige caja abierta.
- Si se paga desde caja, crea egreso de caja con fuente `EXPENSE`.
- No mueve inventario.
