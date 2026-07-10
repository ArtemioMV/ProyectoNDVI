# Productos, compras y ventas

## Objetivo

Controlar productos y materiales sin numeros de serie, con stock actual, stock minimo, entradas, salidas, ajustes, compras y ventas. Este modulo absorbe las hojas del Excel de control financiero: venta de materiales, compra de materiales y su impacto en caja.

## Separacion funcional

- `Productos` contiene catalogo, stock, movimientos y alertas de stock bajo.
- `Compras` contiene comprobantes, conceptos libres e ingreso automatico a stock cuando se selecciona producto.
- `Proveedores` vive como administracion propia dentro de compras: listado, busqueda, datos comerciales y ubicacion. En el formulario de compra se puede crear proveedor inline y queda seleccionado.
- `Ventas` contiene venta de productos, metodo de pago, descuento, precio congelado y salida automatica de stock.
- `Caja` recibe movimientos automaticos de compras y ventas.
- `Servicios` no vive aqui; los planes de Internet/IPTV se administran en el modulo Servicios.

## Tipos de movimiento de productos

- `PURCHASE`: compra o ingreso manual, incrementa stock.
- `INSTALLATION`: material usado en instalacion, reduce stock.
- `REPLACEMENT`: reposicion o cambio entregado, reduce stock.
- `RETURN`: devolucion al almacen, incrementa stock.
- `ADJUSTMENT_IN`: ajuste de entrada, incrementa stock.
- `ADJUSTMENT_OUT`: ajuste de salida, reduce stock.
- `SALE`: salida por venta, se genera desde el modulo Ventas.

## Reglas de negocio

- El sistema no controla numeros de serie ni MAC por producto.
- Todo producto tiene unidad de medida, precio de venta, stock actual y stock minimo.
- El stock inicial genera un movimiento de ingreso.
- Las compras incrementan stock solo cuando el item referencia un producto.
- Las compras tambien aceptan concepto libre para gastos o insumos no inventariables.
- Instalacion, reposicion, venta y ajuste de salida reducen stock.
- Devolucion y ajuste de entrada incrementan stock.
- Un movimiento no se registra si deja stock negativo.
- La venta no se registra si algun producto no tiene stock suficiente.
- El precio de venta queda congelado en el detalle de venta.
- La venta requiere caja abierta y genera ingreso de caja.
- La compra pagada desde caja requiere caja abierta y genera egreso de caja.
- Toda compra y venta se ejecuta en transaccion.
- Los importes se guardan con `Decimal`; nunca con `Float`.

## Pantallas

- Productos: pestañas internas para catalogo, movimientos y stock bajo; formularios en acordeones.
- Compras: registrar compra, crear proveedor inline, conceptos libres, seleccion de producto para mover stock e historial.
- Proveedores: pagina propia con listado, busqueda, creacion, documento, contacto y ubicacion.
- Ventas: registrar venta con metodo/descuento, salida de stock e historial.

