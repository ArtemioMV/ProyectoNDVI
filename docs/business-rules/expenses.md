# Reglas de gastos

## Objetivo

Registrar salidas operativas que no son compras de inventario. Gastos afecta caja y utilidad mensual, pero nunca incrementa ni reduce stock.

## Separacion funcional

- `Compras`: materiales o productos que pueden ingresar a inventario.
- `Gastos`: alquileres, energia, postes, comisiones, movilidad, utiles, impuestos, servicios y otros egresos no inventariables.
- `Planilla`: queda separada como categoria inicial, pero debe evolucionar a modulo propio cuando se gestione personal fijo.

## Categorias

Cada gasto pertenece a una categoria. Tipos disponibles:

- `OPERATING`: operativo general.
- `PAYROLL`: planilla o pagos laborales.
- `RENT`: alquileres.
- `UTILITY`: energia, servicios, telefono, internet, etc.
- `TAX`: rentas, impuestos, contadora.
- `COMMISSION`: comisiones.
- `TRANSPORT`: movilidad, combustible, traslados.
- `OTHER`: otros.

## Reglas

- El gasto requiere categoria activa.
- El importe usa `Decimal`.
- Si `paidFromCash` es `true`, requiere caja abierta.
- Si se paga desde caja, crea movimiento de caja `EXPENSE` con tipo `EXPENSE`.
- Un gasto no mueve inventario.
- Los gastos deben poder filtrarse por periodo `YYYY-MM` para utilidad mensual.
