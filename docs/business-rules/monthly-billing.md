# Facturacion mensual (mensualidades)

Reglas de negocio de las mensualidades. **No es por mes calendario.**

## Ancla del ciclo: fecha de activacion del servicio

- El ciclo de cada servicio se ancla a su **fecha de activacion** (`CustomerService.installedAt`),
  NO al inicio del mes calendario.
- El periodo va de la **fecha de activacion** hasta la **misma fecha del mes siguiente**.
  - Ejemplo: activado el **15/07** -> periodo **15/07 a 15/08**; luego **15/08 a 15/09**; etc.
- El dia de facturacion del cliente = dia del mes de su `installedAt`.
- Cada servicio del cliente puede tener su propia fecha de activacion (su propio ciclo).

## Generacion automatica (sin boton manual)

- Las mensualidades se **generan solas** al iniciar cada ciclo, para los servicios en estado
  `ACTIVE`. El usuario **no** debe pulsar "Generar mensualidad".
- No se duplican: una mensualidad por `servicio + ciclo`.
- El monto de un ciclo completo = precio mensual del plan acordado.

## Prorrateo (corte antes de fin de ciclo)

- Si un servicio se **suspende o cancela antes** de terminar el ciclo, la mensualidad de ese
  ciclo se **prorratea** por los dias efectivamente usados:
  - `monto = precioMensual * (diasUsados / diasDelCiclo)`
  - `diasDelCiclo` = dias entre la fecha de activacion del ciclo y la misma fecha del mes siguiente.
  - `diasUsados` = dias desde el inicio del ciclo hasta la fecha de corte.

## Estado del cliente / servicio

- Solo los servicios `ACTIVE` generan mensualidad. Un servicio `SUSPENDED`/`CANCELLED` no
  genera nuevos ciclos (y el ciclo en curso al momento del corte se prorratea).

## Impacto (pendiente en backend, ver docs/pending-work.md)

- Setear `installedAt` al activar el servicio (hoy puede quedar nulo).
- Motor programado (cron/job) que genere mensualidades por fecha de activacion, no por mes.
- Calculo de prorrateo al suspender/cancelar.
- El boton "Generar mensualidad" del panel es **temporal** hasta que exista la generacion automatica.
