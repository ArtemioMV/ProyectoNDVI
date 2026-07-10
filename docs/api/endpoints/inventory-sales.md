# Endpoints de productos, compras y ventas

Todas las rutas viven bajo `/api/v1`.

## Productos

### GET `/productos`

Lista productos/materiales.

Query:

- `search`: busqueda por nombre o SKU.

### POST `/productos`

Crea un producto/material.

Permiso previsto: `inventario.crear`.

Campos principales:

- `sku`
- `name`
- `description`
- `unit`
- `costPrice`
- `salePrice`
- `initialStock`
- `minStock`

### POST `/productos/:id/movimientos`

Registra un movimiento manual de producto.

Permiso previsto: `inventario.ajustar`.

Tipos aceptados desde Productos:

- `PURCHASE`
- `INSTALLATION`
- `REPLACEMENT`
- `RETURN`
- `ADJUSTMENT_IN`
- `ADJUSTMENT_OUT`

Reglas:

- `PURCHASE`, `RETURN` y `ADJUSTMENT_IN` incrementan stock.
- `INSTALLATION`, `REPLACEMENT` y `ADJUSTMENT_OUT` reducen stock.
- `SALE` no se acepta aqui; se registra desde Ventas.
- No permite stock negativo.

## Compras

### GET `/compras`

Lista las ultimas compras de materiales con proveedor e items.

Permiso previsto: `compras.ver`.

### POST `/compras`

Registra compra de materiales o conceptos libres.

Body base:

```json
{
  "supplierId": "uuid opcional",
  "supplierName": "Proveedor libre opcional",
  "receiptNumber": "B001-123",
  "paymentMethod": "CASH",
  "paidFromCash": true,
  "items": [
    { "materialId": "uuid opcional", "description": "COMPRA DE ONUS", "quantity": 15, "unitCost": 125 }
  ]
}
```

Reglas:

- Requiere al menos un item.
- Si el item tiene `materialId`, incrementa stock y crea movimiento `PURCHASE`.
- Si `paidFromCash` es `true`, exige caja abierta y crea movimiento de caja `EXPENSE` con fuente `PURCHASE`.
- Permite concepto libre sin producto para absorber gastos del Excel que no mueven inventario.

### GET `/compras/proveedores`

Lista proveedores para la pagina de administracion y para el selector de compra.

### POST `/compras/proveedores`

Crea proveedor. Se usa desde la pagina de proveedores y tambien inline dentro del formulario de compra.

Campos principales:

- `name`
- `documentNumber`
- `contactName`
- `phone`
- `email`
- `country`
- `department`
- `province`
- `district`
- `address`
- `reference`
- `notes`

Reglas:

- Proveedor tiene pagina propia en `/compras/proveedores`.
- Si se crea desde una compra, el proveedor queda seleccionado para esa compra.
- La busqueda de documento queda preparada en UI, pendiente de API externa.

## Ventas

### GET `/ventas`

Lista las ultimas ventas de productos.

Permiso previsto: `ventas.ver`.

### POST `/ventas`

Registra una venta de productos.

Permiso previsto: `ventas.crear`.

Body base:

```json
{
  "customerName": "Cliente opcional",
  "documentNumber": "12345678",
  "paymentMethod": "CASH",
  "discountAmount": 0,
  "items": [
    { "materialId": "uuid", "quantity": 2 }
  ]
}
```

Reglas:

- Requiere caja abierta.
- Cliente opcional.
- Requiere al menos un item.
- No permite repetir el mismo producto en la misma venta.
- Valida stock suficiente por producto.
- Descuenta stock y crea movimientos `SALE` en transaccion.
- Crea movimiento de caja `INCOME` con fuente `SALE` por el total neto.

