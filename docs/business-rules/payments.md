# Mensualidades, pagos, contratos y tickets

## Mensualidades

- Una mensualidad pertenece a un servicio contratado.
- La mensualidad es unica por servicio y periodo.
- El periodo usa formato `YYYY-MM`.
- La generacion de mensualidades no duplica el periodo.
- La mensualidad conserva monto, monto pagado, saldo y estado.
- Estados: `PENDING`, `PARTIAL`, `PAID`, `VOID`.

## Pagos

- Un pago pertenece a una mensualidad.
- Se permiten pagos parciales.
- Un pago no puede superar el saldo pendiente.
- Una mensualidad pagada no acepta nuevos pagos.
- El saldo se actualiza en transaccion al registrar el pago.
- Todo pago genera un codigo de ticket.
- Estados de pago: `VALID`, `VOID`.

## Ticket de pago

- El ticket se genera desde un pago registrado.
- Incluye cliente, servicio, periodo, metodo, importe y saldo pendiente.
- El codigo de ticket es unico.

## Contrato simple

- El contrato se genera desde el cliente y sus servicios activos.
- Incluye datos del cliente, planes contratados, total mensual y clausulas base.
- El contrato no crea un registro independiente por ahora; es un documento calculado desde datos vigentes.

## Caja

- La integracion contable con caja queda pendiente.
- El registro de pago ya esta transaccionado y preparado para generar movimiento de caja cuando el modulo Caja este operativo.

## Anulacion de pagos

- Un pago anulado queda con estado `VOID` y no debe contar como dinero pagado de la mensualidad.
- La anulacion recalcula el saldo del periodo y puede devolver la mensualidad a `PENDING` o `PARTIAL`.
- Para mantener caja cuadrada, anular pago requiere caja abierta y registra un egreso de reverso con fuente `PAYMENT`.
- La evidencia adjunta de pagos queda pendiente de modelo de archivos (`evidenceUrl` o tabla documental) antes de habilitar carga real.
