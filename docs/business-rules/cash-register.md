# Reglas de caja

La caja controla el dinero operativo del dia. Pagos, ventas y movimientos manuales deben reflejarse como movimientos de caja para que el cierre compare lo esperado contra lo contado.

## Apertura

- Solo puede existir una caja abierta a la vez.
- La apertura registra `initialAmount` y lo copia como `expectedAmount` inicial.
- Mientras no exista caja abierta, el sistema no debe permitir registrar pagos.

## Movimientos

- Tipos permitidos: `INCOME` y `EXPENSE`.
- Fuentes permitidas: `PAYMENT`, `SALE`, `PURCHASE`, `MANUAL`.
- Un pago registrado genera automaticamente un movimiento `INCOME` con fuente `PAYMENT`.
- Una venta de materiales genera automaticamente un movimiento `INCOME` con fuente `SALE`.
- Una compra pagada desde caja genera automaticamente un movimiento `EXPENSE` con fuente `PURCHASE`.
- Un gasto registrado desde caja genera automaticamente un movimiento `EXPENSE` con fuente `EXPENSE`.
- Un movimiento manual actualiza el saldo esperado de caja en la misma transaccion.
- Los egresos restan del esperado; los ingresos suman.

## Cierre

- El cierre registra `countedAmount` y calcula `difference = countedAmount - expectedAmount`.
- Una caja cerrada no acepta nuevos movimientos.
- El historial de cajas cerradas no debe borrarse.

## Pendiente funcional

- Asociar caja y movimientos al usuario cajero real cuando JWT/guards del backend esten activos.
- Integrar ventas y compras para crear movimientos automaticos de caja.


