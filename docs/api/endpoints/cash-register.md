# Endpoints de caja

Todas las rutas viven bajo `/api/v1`.

## Caja actual

### GET `/caja/actual`

Devuelve la caja abierta actual con sus movimientos. Si no existe caja abierta, devuelve `null`.

## Historial

### GET `/caja/historial`

Lista las ultimas cajas abiertas o cerradas, incluyendo movimientos.

## Apertura

### POST `/caja/abrir`

Abre una nueva caja.

Body:

```json
{ "initialAmount": 100, "notes": "Apertura turno manana" }
```

Reglas:

- Rechaza la operacion si ya existe una caja abierta.
- El saldo esperado inicia con el monto inicial.

## Movimiento manual

### POST `/caja/:id/movimientos`

Registra ingreso o egreso manual.

Body:

```json
{ "type": "INCOME", "amount": 25, "description": "Ingreso manual", "referenceId": "Opcional" }
```

Reglas:

- Solo acepta cajas abiertas.
- `INCOME` incrementa el esperado.
- `EXPENSE` disminuye el esperado.

## Cierre

### POST `/caja/:id/cerrar`

Cierra la caja abierta.

Body:

```json
{ "countedAmount": 350, "notes": "Cierre sin diferencias" }
```

Reglas:

- Guarda el monto contado.
- Calcula diferencia contra el esperado.
- Marca la caja como cerrada.
