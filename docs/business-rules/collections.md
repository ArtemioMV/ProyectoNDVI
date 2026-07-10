# Cobranza

Modulo operativo para gestionar cobros diarios y deuda mensual.

## Objetivo

- Ver todas las mensualidades pendientes, parciales y pagadas por periodo.
- Filtrar por cliente, documento, telefono, periodo y estado.
- Cobrar directamente una mensualidad desde la cola global.
- Entrar a la ficha financiera del cliente para ver contrato, tickets, pagos y anulaciones.

## Reglas

- Cobranza no reemplaza Caja: todo cobro sigue exigiendo caja abierta porque registra ingreso.
- Cobranza no reemplaza la ficha del cliente: la ficha conserva el historial completo, recibos, contrato y anulacion de pagos.
- Los saldos salen de `MonthlyFee.balance`; no se recalculan en frontend.
- Los pagos parciales se muestran como estado `PARTIAL` y siguen quedando cobrables.
