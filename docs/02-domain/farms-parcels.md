# Fundos, parcelas y areas cultivables

## Modelo objetivo

- `farm`: fundo o propiedad agricola.
- `parcel`: unidad fisica canonica interna.
- `cultivable_area`: unidad productiva por parcela, campana, cultivo y variedad.
- `campaign`: periodo agricola.
- `crop` y `variety`: catalogos agricolas.

La etiqueta visible de `parcel` puede configurarse por organizacion: Lote, Parcela, Cuartel, Bloque u otra denominacion local. El nombre interno, tablas, contratos, permisos y carpetas siguen usando `parcel`.

## Legacy

La BD legacy contiene `parcela`, `subparcela`, `lote` y `sublote`. Esos conceptos se tratan como origen de migracion e inventario, no como modelo destino. Ver `docs/03-database/legacy-bd-vs-master-corrections.md`.
