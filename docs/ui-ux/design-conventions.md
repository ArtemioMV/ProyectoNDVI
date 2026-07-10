# Convenciones de UI (NovaLink)

Reglas de diseno del frontend. Aplican **a todo el proyecto de aqui en adelante**.

## Densidad

- **Font-size raiz = 14px** (`html { font-size: 14px }` en `styles/globals.css`).
  Como Tailwind mide en `rem`, esto compacta texto, iconos y espaciado de forma
  proporcional. No subir a 16px "porque se ve chico": la densidad es intencional.
- Texto de cuerpo: `text-sm`. Texto secundario/metadatos: `text-xs`.
- Titulos de pagina: `text-xl` / `text-2xl` (no mas). Subtitulos: `text-sm text-slate-500`.

## Iconos

- Tamano por defecto: **`h-4 w-4`** (nav, botones, chips, indicadores).
- Solo crecer a `h-5` en casos puntuales (logotipo, ilustracion). Evitar `h-6`+.
- Siempre `shrink-0` cuando el icono va junto a texto que puede truncarse.

## Estados de carga

- Usar **siempre** `<DataLoader />` (`components/ui/DataLoader.tsx`), nunca texto suelto
  tipo "Cargando...". Muestra un anillo giratorio + "Cargando datos...".
- Se le puede pasar `label` (texto) y `className` (p. ej. borde de tarjeta).

## Componentes compartidos (USARLOS, no HTML clasico)

- Van en `src/components/ui/`. Disponibles: `Button`, `TextField`, `SelectField`,
  `TextareaField`, `SwitchField`, `CheckboxField`, `RadioCardGroup`, `SegmentedControl`,
  `DisclosurePanel`, `MetricCard`, `AppModal`, `DataLoader`.
- **No** escribir `<input>/<select>/<button>` crudos en pantallas: usar estos componentes
  para que todo tenga el mismo foco, espaciado y estados. Antes de crear uno nuevo, revisar
  si ya existe.

## Formularios y acciones

- Un formulario de alta/edicion **no va suelto** en la pagina. Se abre desde un boton en:
  - **`AppModal`** (formularios de varios campos, p. ej. Nuevo cliente), o
  - **`DisclosurePanel`** (paneles que se despliegan, p. ej. crear plan en Servicios).
- Evitar acciones duplicadas: si el alta ya vive en un panel/modal, no repetir botones
  "Crear" sueltos en otras tarjetas.

## Elegir el contenedor con criterio (importante)

**No apilar acordeones uno debajo de otro.** Segun el peso del contenido:

| Contenido | Contenedor |
|-----------|-----------|
| Pocos campos relacionados | inline en la tarjeta actual |
| Un grupo colapsable ocasional | **un** `DisclosurePanel` (nunca dos hermanos apilados) |
| Formulario/accion de varios campos | `AppModal` |
| Flujo largo con muchas secciones (alta/edicion) | **pagina propia** |
| Detalle/edicion junto a una lista | panel lateral / parte de la ventana |

Regla practica: si el usuario tendria que hacer scroll pasando acordeones apilados,
debio ser un modal o una pagina. La UI se hace **con criterio**, no metiendo todo en
acordeones uno sobre otro.

## Pantallas de acceso (auth)

- Login, recuperar contrasena y verificar cuenta comparten `AuthShell`
  (`modules/auth/components/AuthShell.tsx`): panel de marca a la izquierda y la
  tarjeta del formulario **siempre en la misma posicion** a la derecha.
- Al agregar una pantalla de auth nueva, envolverla en `AuthShell` para no romper
  la homogeneidad (que el centro no salte al navegar).

## Tablas y listas (filtros + paginacion)

- Toda lista que pueda crecer (clientes, productos, ventas, compras, gastos, pagos)
  **debe** tener: buscador, filtros relevantes y **paginacion** (o scroll infinito).
- La paginacion se hace en el **backend** (`page`, `pageSize`) y el front manda esos
  params; no traer miles de filas y paginar en cliente.
- Estados vacios claros (usar `Alert`/texto) y `DataLoader` mientras carga.
- Cuidado: no dejar tablas sin paginar "porque hay pocos datos" — se llenan en produccion.

## Mapa / ubicacion

- El alta de cliente captura `latitude`/`longitude`. El mapa interactivo (tiles +
  geocodificacion) usa `MAP_TILES_URL` y `GEOCODING_API_URL` del backend (integracion pendiente).

## Marca

- Nombre/logo/colores salen de `config/branding.ts` (seran administrables desde el
  panel). No hardcodear el nombre de la empresa en las pantallas.
