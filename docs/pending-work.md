# Pendientes (backlog vivo)

Fuente unica de tareas pendientes. En vez de dejar `TODO` en el codigo, se registran aqui con contexto. Al cerrar una tarea se marca `[x]` y se referencia el commit/PR.

## Auth (frontend listo, backend pendiente)

- [x] `POST /auth/login` real contra tabla `User` con JWT (roles + permisos). Admin seed:
      `admin`/`change_me_admin`. Interceptor en `http-client.ts` adjunta el token y maneja 401.
- [x] Dashboard con metricas reales (clientes/servicios activos, deuda, cobrado del mes,
      mensualidades pendientes/vencidas, caja del dia) desde cobranza/caja/customers.
- [ ] `POST /auth/forgot-password`: la UI en `forgot-password-page.tsx` ya envia el flujo, falta el endpoint que emita el token/enlace de restablecimiento.
- [ ] `POST /auth/reset-password`: consumir el token y setear nueva contrasena.
- [ ] `POST /auth/verify-account`: la UI en `verify-account-page.tsx` ya captura el codigo, falta validar el codigo contra el backend.
- [ ] Guard/JWT en el backend + interceptor en `http-client.ts` que adjunte el token.
- [x] Creacion de cuentas desde el panel (2026-07-10): pagina `/administracion` (nav "Administracion")
      con tabla de usuarios (crear/editar/activar-desactivar con confirmacion, asignacion de roles
      por capsulas), tarjetas de roles y modal de rol con permisos agrupados por modulo.
      Usa los endpoints existentes de `usuarios`/`roles`/`permisos`.
- [ ] Ocultar el item "Administracion" del nav para usuarios sin permiso `usuarios.ver`
      (hoy el guard del backend rechaza, pero el item se muestra a todos).

## Base de datos / migraciones

- [x] `DATABASE_URL` de desarrollo: `apps/backend/.env` (localhost) + puerto Postgres publicado en `compose.development.yaml`. Postgres 18 corriendo y accesible en `localhost:5432`.
- [ ] Aplicar la migracion real de Prisma (`MonthlyFee`, `Payment`, `CashRegister`, `CashMovement`, inventario, compras, ventas). Correr en el contenedor: `docker compose exec backend pnpm --filter @iptv/backend prisma:migrate`, o local con el `.env` anterior. Hoy `prisma/migrations/` esta vacio.

## Nucleo Fase 2 (recurrente, no ventas)

Flujo: Cliente -> Servicios -> Mensualidades (auto por fecha de alta) -> Pagos -> Caja.

- [x] Modelo Prisma inicial: `MonthlyFee` y `Payment` (mensualidades, pagos parciales, ticket, contrato simple).
- [x] Generacion manual de mensualidades por periodo sin duplicar servicio+periodo.
- [x] Modulo Cobros/Pagos inicial: parcial/total, metodo, historial por cliente y ticket.
- [x] Estado de cuenta en la ficha del cliente: deuda, historial, generar mensualidad, cobrar, contrato y ticket.
- [x] Pagina de detalle del cliente `/clientes/:id` ("Ver todo"): servicios/planes, ubicacion,
      contrato imprimible e `CustomerFinancePanel` (deuda/pagos/historial). Acordeon de la tabla con
      botones Ver todo / Deuda-Pagar / Contrato.
- [x] Pago: evidencia por pago — ya implementado end-to-end (DTO `evidences`, tabla
      `PaymentEvidence`, UI en modal de cobro e historial).
- [x] Mapa interactivo con **MapLibre GL** (open-source, sin token) sobre tiles OSM
      (`components/map/LocationMap.tsx`): modo editable con **clic/arrastrar para fijar** el pin,
      boton "Usar mi ubicacion" (geolocalizacion) y link a Google Maps. En el alta ya fija
      coordenadas; en el detalle mostrara el punto cuando el backend persista `latitude`/`longitude`.
      Dependencia `maplibre-gl` horneada en la imagen (persistente al recrear).
- [ ] Cambiar la fuente de tiles a `MAP_TILES_URL` propio si se quiere estilo/branding o evitar
      la carga a los servidores publicos de OSM en produccion.
- [x] Modelo Prisma: `CashRegister`, `CashMovement` e integracion de pagos con caja.
- [x] Caja: apertura, movimientos manuales, cierre con esperado vs contado e historial.
- [x] Ligar Cobros/Pagos a Caja: el pago exige caja abierta y crea movimiento `PAYMENT`.
- [ ] Ligar Caja/Pagos al usuario cobrador real cuando JWT/guards del backend esten activos.
- [x] **Facturacion por fecha de activacion** (Bloque 4, 2026-07-10) — `monthly-billing.md`:
      `BillingSchedulerService` (payments) corre al arrancar y cada 6h llamando
      `generateAutomaticMonthlyFees` (idempotente por upsert servicio+periodo). Helper compartido
      `src/shared/billing-cycle.ts`. **Prorrateo** al suspender/cancelar servicio o cliente
      (monto = precio * diasUsados/diasCiclo, nunca menor a lo pagado) y **mensualidad inmediata**
      al activar/reactivar/agregar servicio. Boton temporal "Generar mes" eliminado de la UI
      (el endpoint manual sigue disponible por API).
- [x] Evidencia de pago: verificado end-to-end (el backlog estaba desactualizado) — el modal la
      captura, `registerPayment` la persiste en `PaymentEvidence` y el historial la muestra.
- [x] Contrato A4 completo (`ContractDocument`): partes, datos del cliente, tabla de servicios,
      9 clausulas, firmas y pie; `@page A4` en `globals.css`. Pagina `/clientes/:id/contrato` con
      Imprimir/PDF, "Enviar por correo" (mailto redactado) y "Enviar por WhatsApp" (wa.me con link).
- [ ] Envio real de correo con adjunto PDF desde el backend usando el SMTP de configuracion
      (hoy `mailto:` abre el cliente local y el PDF se adjunta a mano). Requiere endpoint
      `POST /communications/send-contract` + render PDF server-side (ej. puppeteer/playwright).
- [ ] Link publico de contrato para WhatsApp: hoy el link exige sesion del panel. Requiere
      endpoint publico con token firmado de un solo uso (ej. `/public/contratos/:token`).
- [x] Ticket para operaciones que mueven dinero (Bloque 2, 2026-07-10): `receiptCode` unico en
      `MaterialSale`/`MaterialPurchase`/`Expense`/`CashMovement` (migracion
      `20260710030000_receipt_codes_money_ops`), generado con `formatReceiptCode` compartido
      (`V-/C-/G-/M-AAAA-000001`, mismo formato `T-` de pagos). Componente compartido
      `TicketDocument`/`TicketModal` (80mm, imprime via `.contract-print`, Descargar/Correo/
      WhatsApp) + boton "Ver ticket" y columna Ticket en Ventas/Compras/Gastos.
- [ ] Ticket en UI para movimientos manuales de caja (el codigo M- ya se genera; falta boton
      en `CashMovementList`).
- [ ] Unificar el ticket de Cobranza (`TicketBox` plano) con el `TicketModal` compartido.
- [ ] Los registros antiguos no tienen `receiptCode` (columna nullable); solo los nuevos lo llevan.



## Modulo Reportes (2026-07-10)

- [x] Backend `ReportsModule`: `GET /reportes/resumen?from&to` (cobrado + desglose por metodo,
      ventas, compras, gastos, resultado neto, deuda total, morosos, top 8 deudores, clientes por
      estado) y `GET /reportes/mensual` (serie 6 meses ingresos vs salidas). Permiso `reportes.ver`.
- [x] Frontend `/reportes`: rango de fechas (`DateRangeFilter`), 5 KPI (`MetricCard`), grafico de
      barras CSS sin dependencias, top deudores con acciones Cobrar/Ver ficha, cobrado por metodo
      con barras de proporcion y resumen de cartera.
- [ ] Exportar reportes (CSV/impresion) cuando se pida.


## Socios y ganancias + permisos por pagina (2026-07-11)

- [x] Modelo `Partner` (nombre, % participacion, activo; suma activa max 100%) con CRUD
      `/socios` y panel "Socios" en Configuracion (mini-switch activo, modal alta/edicion).
- [x] `GET /reportes/ganancias?year=`: tabla anual estilo "CONTROL FINANCIERO MULTIVISION"
      (ingreso/salida/neto/margen por mes) + reparto de la ganancia neta entre socios activos.
      Seccion "Ganancias por socio" en Reportes.
- [x] `MiniSwitch` compartido (interruptor compacto) en ToggleControls.
- [x] Permisos de rol a **pagina propia** `/administracion/roles/nuevo` y `/administracion/roles/:id`
      (mini-switches por modulo y accion, master switch por modulo). El modal se elimino.
- [x] Proveedores como modulo propio en el nav (`/proveedores`).

## Bloque 1: estados y anulaciones (2026-07-10)

- [x] Suspender/cancelar/reactivar **cliente** (`PATCH /customers/:id/estado`, cascada a servicios)
      y **servicio** (`PATCH /customers/:id/servicios/:serviceId/estado`, fija `installedAt` al
      activar). UI en la ficha con `IconAction` + `AppModal` de confirmacion.
- [x] Anular **venta** (`PATCH /ventas/:id/anular`: repone stock + egreso en caja), **compra**
      (`PATCH /compras/:id/anular`: retira stock + devuelve efectivo si `paidFromCash`; bloquea si
      el stock ya se consumio) y **gasto** (`PATCH /gastos/:id/anular`). UI: columna Estado
      (`DocumentStatusBadge`) + accion Anular con confirmacion en las tres listas.
- [x] Caja: cierre movido a `AppModal` de confirmacion (elimina DisclosurePanels apilados) y
      **reabrir caja** (`POST /caja/:id/reabrir`, permiso `caja.reabrir` en seed; solo si no hay
      otra abierta) desde el historial.
- [ ] Prorrateo al suspender/cancelar servicio (hoy solo cambia estado; ver monthly-billing.md).
- [ ] Auditar (AuditLog) las transiciones de estado y anulaciones con el usuario que las hizo.


## Bloque 3: catalogo editable y formularios faltantes (2026-07-10)

- [x] Productos: `PATCH /productos/:id` + acciones Editar (modal reusa `MaterialForm` con
      `initialValues`) y Activar/Desactivar con confirmacion en `MaterialsTable`.
- [x] Proveedores: `PATCH /compras/proveedores/:id` + acciones Editar (modal reusa `SupplierForm`)
      y Activar/Desactivar con confirmacion en `SuppliersList`.
- [x] Backend `POST /customers/:id/servicios` (agregar plan a cliente existente, regla: un servicio
      vigente por tipo). SIN UI a proposito: la gestion de planes del cliente ira en su propio
      modulo (decision del dueno; no ponerla en la ficha).
- [x] Gastos: "Crear categoria" pasa de DisclosurePanel apilado a `AppModal` (cumple convencion).
- [x] Configuracion: boton + modal "Agregar metodo de pago" usando `POST /metodos-pago` (solo
      metodos del enum aun no configurados).
- [x] Cobranza: opcion "Anulado" en el filtro de estado.
- [x] Botones de accion de listas normalizados a `IconAction variant="outline"` (sobrio).

## Clientes (alta en pagina nueva)

- [x] Alta de cliente en pagina propia `/clientes/nuevo` (documento, nombres/apellidos separados, ubicacion, servicios). Contrato se genera desde la ficha (`CustomerFinancePanel`).
- [ ] API de documento (RENIEC/SUNAT) que rellene nombres/apellidos y ubicacion desde el boton "Buscar" del alta.
- [x] Paises (193) + ubigeo oficial INEI (25+ deptos, ~196 provincias, ~1895 distritos) en
      `public/data/*.json`, servidos como dato (fuera del bundle) y consumidos por `services/geo/geo.ts`.
      Selects encadenados departamento -> provincia -> distrito en el alta.
- [ ] Mover paises/ubigeo a tablas en la BD detras de un endpoint (hoy es JSON estatico).
- [ ] **BLOQUEA persistencia**: el backend valida con `forbidNonWhitelisted: true`, asi que el
      front NO puede mandar campos extra sin romper el alta (400). Para guardar todo lo que el alta
      ya captura, extender `CreateCustomerDto` + modelo + migracion con:
      `firstName`, `lastName`, `country`, `department`, `province`, `latitude`, `longitude`,
      `installationLaborCost`, y `materials: [{ materialId, quantity }]` (que descuente stock con
      el `installPrice`). Mientras tanto el front solo envia lo soportado
      (`fullName`, `address`, `district`, `services`).
- [ ] Mapa interactivo de ubicacion (tiles `MAP_TILES_URL` + geocodificacion): el alta ya captura
      `latitude`/`longitude`; falta el mapa para elegir/mostrar el punto.
- [x] Alta de cliente: acordeon de "Materiales de instalacion" que jala del inventario (productos
      marcados como material de instalacion), suma el costo y lo pasa al resumen. Front listo.
- [x] **Backend producto: 3 precios de venta** (`salePrice`, `coveragePrice`, `installPrice`) +
      `isInstallationMaterial` + `imageUrl`, en modelo Prisma + DTO + servicio + migracion aplicada.
      (Arreglado el bug: antes el DTO rechazaba esos campos con `forbidNonWhitelisted` -> 400.)
- [ ] Descontar stock de materiales al guardar el cliente (cuando el alta envie los materiales).

## Compras y ventas

- [x] Compras: registrar proveedor, comprobante, items y movimiento automatico de inventario/caja.
- [x] Ventas: ligar venta de materiales a caja con movimiento `SALE`.
- [x] POS de ventas en pagina propia `/ventas/nueva`: catalogo en tarjetas con foto, 3 precios con
      radio, cantidad y descuento por producto; carrito en tarjetas 2-3 col con arrastrar-al-tacho
      para eliminar. Front listo.
- [x] POS de compras en `/compras/nueva` **reutilizando** los mismos componentes
      (`components/pos/pos-primitives.tsx` + `PaymentSplit.tsx`): catalogo con costo por item,
      proveedor, comprobante y pago dividido. Sin duplicar codigo.
- [ ] **Backend venta (para el POS)**: hoy el payload solo acepta `{materialId, quantity}` +
      `discountAmount` global. Falta soportar por item: `unitPrice`/`priceType` (los 3 precios) y
      `discount`. Mientras tanto el POS envia cantidad + descuento sumado y el backend usa `salePrice`.
- [x] POS ventas: **sin costo** (lo ve otro modulo), **3 precios de venta** (Venta/Cobertura/Instalacion)
      con radio; **arrastrar** tarjeta a la lista la agrega (precio cobertura); arrastrar item del
      carrito al catalogo o al tacho lo quita; el carrito muestra ~3 filas y luego hace scroll.
- [x] POS: pago dividido (varios metodos con apagador + monto) y **adjuntar evidencia** (todos
      menos efectivo). Front listo.
- [ ] **Backend venta pago dividido + evidencia**: hoy solo acepta un `paymentMethod`. Falta
      `payments: [{ method, amount, evidenceUrl }]`. El POS envia el metodo con mayor monto y
      guarda la evidencia solo en UI (nombre del archivo); falta subir el archivo y persistir.
- [x] Gastos: categorias, registro, historial por periodo y egreso automatico de caja.
- [ ] Historial completo de movimientos de inventario por producto.
- [ ] Cierre financiero mensual: ingresos, compras, gastos, utilidad neta y margen.
- [ ] Socios y reparto mensual de utilidad.

## Configuracion administrable desde el panel

- [x] Pagina `/configuracion`: nombre, lema, RUC, telefono, correo, direccion y **subida de logo**.
      Reactivo (`useCompanySettings`), se refleja en sidebar/login. Persistencia interim en
      localStorage (`services/settings/company-settings.ts`).
- [x] Plantilla de **contrato HTML imprimible** (`components/documents/ContractDocument.tsx`) +
      CSS de impresion. Ver ADR-002. Vista previa en la pagina de configuracion.
- [ ] Backend: endpoint de settings para persistir empresa/logo en la BD (hoy es localStorage).
- [x] Contrato real: boton "Generar contrato" en la ficha del cliente abre `ContractDocument`
      con datos reales (cliente + servicios + empresa) y se imprime.

## Tablas / listas (cuidado)

- [ ] Paginacion + filtros en todas las listas (clientes, productos, ventas, compras, gastos,
      pagos). Hacer la paginacion en backend (`page`, `pageSize`); el front manda params.
      Convencion en `docs/ui-ux/design-conventions.md`. Hoy varias listas traen todo sin paginar.

## Componentes UI pendientes

- [x] `Tooltip` propio (hover + focus), en uso en el alta de cliente.
- [x] Toasts globales (`ToastProvider` + `useToast`), en uso en alta y configuracion.
- [ ] `Timer`/contador (aun no).
- [x] `BackButton`, `Alert`, `DataLoader`, `SwitchField` (corregido el deslizamiento).

## Movil / instalable (Android + iPhone)

- [x] PWA base: `manifest.webmanifest` + icono + metas de "agregar a pantalla de inicio"
      (sin service worker, para no reintroducir problemas de cache en dev).
- [ ] Iconos PNG (192/512) y `apple-touch-icon` PNG reales (hoy es SVG; iOS prefiere PNG).
- [ ] Service worker / offline (PWA completa) — decidir con cuidado por la cache; o empaquetar
      con Capacitor para apps nativas Android/iOS. Pensar el diseno touch-first de aqui en adelante.
- [ ] Revisar que drag-and-drop tenga alternativa touch (el POS ya trae boton X ademas del arrastre).

## Infra

- [x] Postgres 18-alpine (ojo: PGDATA movido a `/var/lib/postgresql`, volumen ajustado).
- [x] Redis 8-alpine, nginx 1.29-alpine.
- [x] `.dockerignore` (evita meter node_modules de Windows al contenedor).
- [x] Dev con HMR (volumen + websocket en nginx).


