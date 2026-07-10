# Plan Maestro del Sistema de Gestión IPTV e Internet

## 1. Propósito del documento

Este documento define la base técnica, funcional y organizativa para el desarrollo de un sistema web orientado a la gestión de clientes que contratan servicios de IPTV, internet u otros servicios futuros.

El sistema debe construirse desde el inicio con una arquitectura clara, modular, estable y preparada para crecer sin convertir el proyecto en una solución innecesariamente compleja.

El desarrollo se organizará por fases. La primera fase construirá toda la base técnica del proyecto. La segunda implementará el núcleo funcional de clientes, servicios, mensualidades, pagos y caja. La tercera incorporará inventario, compras y ventas. Las siguientes fases completarán soporte técnico, comunicaciones, reportes, portal del cliente y mejoras operativas.

---

# 2. Visión general del sistema

El sistema permitirá administrar:

- Clientes.
- Direcciones del cliente.
- Servicios contratados.
- Planes de IPTV.
- Planes de internet.
- Cantidad de televisores contratados en IPTV.
- Mensualidades.
- Pagos parciales y totales.
- Historial de pagos.
- Deudas pendientes de meses anteriores.
- Apertura, cierre y reapertura de caja.
- Usuarios, roles y permisos.
- Consulta de datos por DNI.
- Ubicaciones de clientes mediante mapas.
- Técnicos internos y órdenes de trabajo.
- Inventario.
- Compras.
- Ventas.
- Comunicaciones por WhatsApp y correo.
- Tickets y contratos simples.
- Reportes administrativos y operativos.

El sistema debe ser sencillo de utilizar, estable, modular y fácil de mantener.

---

# 3. Principios del proyecto

## 3.1 API REST obligatoria

La API REST forma parte del sistema desde el primer día. No es una funcionalidad futura ni opcional.

La arquitectura principal será:

```text
Frontend React
      ↓ HTTP/JSON
API REST NestJS
      ↓ Prisma ORM
PostgreSQL
```

El frontend nunca accederá directamente a PostgreSQL.

Toda operación debe pasar por la API REST:

- Iniciar sesión.
- Consultar clientes.
- Registrar clientes.
- Consultar planes.
- Contratar servicios.
- Generar mensualidades.
- Registrar pagos.
- Abrir o cerrar caja.
- Registrar productos.
- Registrar compras.
- Registrar ventas.
- Consultar reportes.

La API deberá utilizar rutas versionadas:

```text
/api/v1/auth
/api/v1/clientes
/api/v1/direcciones
/api/v1/planes
/api/v1/servicios
/api/v1/mensualidades
/api/v1/pagos
/api/v1/caja
/api/v1/productos
/api/v1/compras
/api/v1/ventas
/api/v1/tecnicos
/api/v1/ordenes-trabajo
/api/v1/usuarios
/api/v1/roles
/api/v1/permisos
/api/v1/reportes
/api/v1/integraciones
```

## 3.2 Monolito modular

La aplicación comenzará como un monolito modular.

Esto significa:

- Un backend principal.
- Una sola base de datos PostgreSQL.
- Módulos separados por responsabilidad.
- Reglas de negocio aisladas.
- Código desacoplado.
- Posibilidad de separar módulos en el futuro si fuera necesario.

No se utilizarán microservicios en la primera etapa.

## 3.3 Simplicidad controlada

El proyecto debe ser completo, pero no excesivamente complicado.

No se incluirá inicialmente:

- Control de equipos por serie.
- Control de equipos por MAC.
- Varias sucursales.
- Varias cajas físicas por local.
- Contabilidad completa.
- Nómina avanzada.
- Microservicios.
- Facturación electrónica completa.
- Redes técnicas avanzadas.
- Seguimiento individual de cada televisor.

Estas funcionalidades podrán incorporarse únicamente si después resultan necesarias.

## 3.4 Modularidad

Cada módulo tendrá:

- Entidades propias.
- Servicios de negocio.
- Controladores.
- DTO.
- Validaciones.
- Casos de uso.
- Permisos.
- Pruebas.
- Documentación.


## 3.6 Criterio de experiencia de usuario

El sistema debe priorizar flujos en contexto. Cuando una accion puede resolverse dentro de un panel o modal, no debe enviar al usuario a otra pantalla salvo que se trate de una vista completa o formal.

Reglas operativas de UX:

- Los paneles de detalle rapido deben mostrar acciones y datos utiles sin duplicar informacion ya visible en el resumen.
- Las pesta�as internas deben poder activarse y desactivarse para volver al estado inicial del panel.
- La navegacion completa, como `Ver todo`, debe diferenciarse visualmente de acciones internas como pagos o contrato.
- Los separadores de valores dentro de una misma celda deben usar `|`.
- Los servicios deben mostrarse con iconos por tipo: WiFi para internet y TV/monitor para IPTV.
- Los mapas pequenos son validos dentro de detalles de cliente cuando ayudan a confirmar ubicacion; el mapa completo queda en el modulo dedicado.
## 3.5 Seguridad desde el inicio

La seguridad no se agregará al final.

Desde la primera fase se debe implementar:

- Autenticación.
- Autorización por roles y permisos.
- Hash seguro de contraseñas.
- Validación de entradas.
- Auditoría de operaciones sensibles.
- Protección de credenciales externas.
- Rate limiting.
- Configuración segura de CORS.
- Gestión de sesiones o tokens.
- Separación entre variables públicas y privadas.

---

# 4. Stack tecnológico

## 4.1 Frontend

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
React Router
MapLibre GL JS
Axios o cliente HTTP centralizado
```

### Responsabilidades del frontend

- Interfaz administrativa.
- Formularios.
- Tablas.
- Filtros.
- Reportes visuales.
- Dashboard.
- Gestión de estados de carga.
- Gestión de errores.
- Consumo de la API REST.
- Visualización de ubicaciones.
- Control visual de permisos.

La seguridad real siempre se aplicará en el backend.

## 4.2 Backend

```text
NestJS
TypeScript
Prisma ORM
PostgreSQL
Swagger / OpenAPI
Class Validator
Class Transformer
JWT o sesiones seguras
Redis para colas, caché y tareas temporales
```

### Responsabilidades del backend

- Reglas de negocio.
- Acceso a datos.
- Validación.
- Autenticación.
- Autorización.
- Auditoría.
- Integraciones externas.
- Procesos programados.
- Generación de mensualidades.
- Registro de pagos.
- Control de caja.
- Inventario.
- Reportes.

## 4.3 Base de datos

```text
PostgreSQL
Prisma Schema
Prisma Migrate
Prisma Client
```

Reglas:

- Los importes monetarios usarán `Decimal`.
- No se utilizará `float` para dinero.
- Las migraciones se guardarán en Git.
- No se utilizará `prisma db push` en producción.
- Las eliminaciones sensibles serán lógicas o mediante anulación.
- Las operaciones financieras usarán transacciones.

## 4.4 Infraestructura

```text
Docker
Docker Compose
Nginx
PostgreSQL
Redis
Backend NestJS
Frontend React
```

Solo Nginx expondrá puertos al host.

```text
Internet
   ↓
Nginx :80 / :443
   ├── Frontend
   └── API REST
        ├── PostgreSQL
        └── Redis
```

No se publicarán directamente:

- Puerto del backend.
- Puerto de PostgreSQL.
- Puerto de Redis.
- Puerto del frontend interno.

## 4.5 Integraciones externas

La API del sistema podrá consumir:

- API externa de consulta de DNI.
- API de WhatsApp.
- Servicio de correo.
- Servicio de geocodificación.
- Proveedor de mapas.
- Servicios futuros.

Todas las claves deben mantenerse en el backend.

---

# 5. Arquitectura del sistema

## 5.1 Flujo principal

```text
Usuario
   ↓
Frontend React
   ↓
Nginx
   ↓
API REST NestJS
   ↓
Servicios de negocio
   ↓
Prisma ORM
   ↓
PostgreSQL
```

## 5.2 Flujo con APIs externas

```text
Frontend React
      ↓
API REST NestJS
      ├── PostgreSQL
      ├── API de DNI
      ├── WhatsApp
      ├── Correo
      └── Mapas / geocodificación
```

## 5.3 Arquitectura por capas

### Capa de presentación

- React.
- Componentes UI.
- Formularios.
- Dashboard.
- Mapas.

### Capa API

- Controladores REST.
- DTO.
- Guards.
- Interceptores.
- Pipes.
- Filtros de excepciones.

### Capa de aplicación

- Casos de uso.
- Servicios.
- Reglas del sistema.
- Coordinación entre módulos.

### Capa de dominio

- Entidades.
- Estados.
- Reglas financieras.
- Reglas de caja.
- Reglas de mensualidades.

### Capa de infraestructura

- Prisma.
- PostgreSQL.
- Redis.
- Correo.
- WhatsApp.
- DNI.
- Mapas.

---

# 6. Estructura general del repositorio

```text
iptv-internet-platform/
├── apps/
│   ├── frontend/
│   └── backend/
│
├── packages/
│   ├── ui/
│   ├── shared-types/
│   ├── validations/
│   ├── config/
│   ├── eslint-config/
│   └── tsconfig/
│
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── business-rules/
│   ├── ui-ux/
│   ├── deployment/
│   ├── integrations/
│   ├── testing/
│   ├── decisions/
│   └── phases/
│
├── skills/
│   ├── frontend/
│   ├── ui-ux/
│   ├── backend/
│   ├── database/
│   ├── security/
│   ├── testing/
│   ├── devops/
│   ├── integrations/
│   └── documentation/
│
├── infrastructure/
│   ├── nginx/
│   ├── docker/
│   ├── postgres/
│   ├── redis/
│   └── scripts/
│
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── compose.yaml
├── compose.development.yaml
├── compose.production.yaml
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── README.md
└── LICENSE
```

---

# 7. Estructura del frontend

```text
apps/frontend/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   ├── layouts/
│   │   └── guards/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── clientes/
│   │   ├── direcciones/
│   │   ├── planes/
│   │   ├── servicios/
│   │   ├── mensualidades/
│   │   ├── pagos/
│   │   ├── caja/
│   │   ├── inventario/
│   │   ├── compras/
│   │   ├── ventas/
│   │   ├── tecnicos/
│   │   ├── ordenes-trabajo/
│   │   ├── comunicaciones/
│   │   ├── reportes/
│   │   └── administracion/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── feedback/
│   │   ├── navigation/
│   │   └── charts/
│   │
│   ├── services/
│   │   ├── api/
│   │   ├── auth/
│   │   └── integrations/
│   │
│   ├── hooks/
│   ├── schemas/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   ├── assets/
│   ├── styles/
│   └── main.tsx
│
├── public/
├── Dockerfile
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 7.1 Organización por módulo

Ejemplo:

```text
modules/clientes/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── types/
├── utils/
└── index.ts
```

## 7.2 Reglas del frontend

- Cada módulo debe contener su propia lógica.
- Los componentes globales deben ser reutilizables.
- Los formularios deben usar React Hook Form y Zod.
- Las consultas deben usar TanStack Query.
- No se deben hacer llamadas HTTP directamente dentro de componentes visuales.
- Los errores deben mostrarse de forma clara.
- Toda tabla debe permitir paginación.
- El diseño debe ser responsive.
- El menú debe soportar modo expandido y contraído.
- La navegación visible dependerá de permisos.
- Se debe evitar llenar todas las pantallas con tarjetas innecesarias.

---

# 8. Estructura del backend

```text
apps/backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── pipes/
│   │   ├── constants/
│   │   ├── exceptions/
│   │   └── utils/
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── auth.config.ts
│   │   ├── redis.config.ts
│   │   └── integrations.config.ts
│   │
│   ├── infrastructure/
│   │   ├── prisma/
│   │   ├── redis/
│   │   ├── mail/
│   │   ├── whatsapp/
│   │   ├── dni/
│   │   └── maps/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── audit/
│   │   ├── clients/
│   │   ├── addresses/
│   │   ├── plans/
│   │   ├── services/
│   │   ├── monthly-fees/
│   │   ├── payments/
│   │   ├── cash-register/
│   │   ├── inventory/
│   │   ├── purchases/
│   │   ├── sales/
│   │   ├── technicians/
│   │   ├── work-orders/
│   │   ├── communications/
│   │   ├── reports/
│   │   └── settings/
│   │
│   └── health/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── test/
├── Dockerfile
├── nest-cli.json
├── tsconfig.json
└── package.json
```

## 8.1 Estructura interna de un módulo

```text
modules/clients/
├── clients.module.ts
├── clients.controller.ts
├── clients.service.ts
├── dto/
├── entities/
├── repositories/
├── use-cases/
├── policies/
└── tests/
```

## 8.2 Reglas del backend

- Los controladores no deben contener lógica compleja.
- Los servicios deben encapsular las reglas de negocio.
- Los DTO deben validar toda entrada.
- Las respuestas deben ser consistentes.
- Las operaciones financieras deben ejecutarse en transacciones.
- Las operaciones sensibles deben generar auditoría.
- Los errores deben usar códigos claros.
- Las integraciones externas deben estar desacopladas.
- Las credenciales nunca deben exponerse.
- Los endpoints deben documentarse en Swagger.

---

# 9. Estructura de documentación

```text
docs/
├── architecture/
│   ├── overview.md
│   ├── backend-architecture.md
│   ├── frontend-architecture.md
│   ├── infrastructure.md
│   └── data-flow.md
│
├── database/
│   ├── data-model.md
│   ├── entities.md
│   ├── relationships.md
│   ├── migrations.md
│   └── seeds.md
│
├── api/
│   ├── conventions.md
│   ├── authentication.md
│   ├── authorization.md
│   ├── errors.md
│   ├── pagination.md
│   └── endpoints/
│
├── business-rules/
│   ├── clients.md
│   ├── services.md
│   ├── monthly-fees.md
│   ├── payments.md
│   ├── cash-register.md
│   ├── inventory.md
│   └── work-orders.md
│
├── ui-ux/
│   ├── design-system.md
│   ├── navigation.md
│   ├── tables.md
│   ├── forms.md
│   ├── dashboards.md
│   └── accessibility.md
│
├── integrations/
│   ├── dni.md
│   ├── maps.md
│   ├── whatsapp.md
│   └── email.md
│
├── deployment/
│   ├── docker.md
│   ├── nginx.md
│   ├── environments.md
│   ├── backups.md
│   └── production.md
│
├── testing/
│   ├── strategy.md
│   ├── backend-tests.md
│   ├── frontend-tests.md
│   └── acceptance-tests.md
│
├── decisions/
│   ├── ADR-001-monolith-modular.md
│   ├── ADR-002-rest-api.md
│   ├── ADR-003-prisma-postgresql.md
│   └── ADR-004-nginx-only-entrypoint.md
│
└── phases/
    ├── phase-01-foundation.md
    ├── phase-02-core-business.md
    ├── phase-03-inventory.md
    ├── phase-04-technical-operations.md
    ├── phase-05-communications.md
    └── phase-06-client-portal.md
```

---

# 10. Skills del proyecto

La carpeta `skills` contendrá instrucciones operativas para mantener consistencia en el desarrollo.

No serán documentos generales. Cada skill debe explicar exactamente cómo se trabaja en el proyecto.

## 10.1 Skill de frontend

Ruta:

```text
skills/frontend/SKILL.md
```

Debe definir:

- Cómo crear módulos.
- Cómo crear páginas.
- Cómo crear formularios.
- Cómo consumir la API.
- Cómo manejar errores.
- Cómo manejar estados de carga.
- Cómo organizar componentes.
- Cómo nombrar archivos.
- Cómo trabajar con TanStack Query.
- Cómo trabajar con React Hook Form y Zod.
- Cómo usar los permisos.
- Cómo trabajar con MapLibre GL.

## 10.2 Skill de UI/UX

Ruta:

```text
skills/ui-ux/SKILL.md
```

Debe definir:

- Sistema visual.
- Tipografía.
- Espaciado.
- Jerarquía.
- Colores.
- Estados de botones.
- Estados de formularios.
- Tablas.
- Filtros.
- Modalidad de navegación.
- Diseño responsive.
- Accesibilidad.
- Uso correcto de tarjetas.
- Evitar interfaces saturadas.
- Criterios para dashboard gerencial.

## 10.3 Skill de backend

Ruta:

```text
skills/backend/SKILL.md
```

Debe definir:

- Estructura de módulos NestJS.
- Diseño de controladores.
- Casos de uso.
- Servicios.
- Validación.
- Manejo de errores.
- Auditoría.
- Seguridad.
- Transacciones.
- Convenciones de endpoints.
- Swagger.
- Integraciones externas.

## 10.4 Skill de base de datos

Ruta:

```text
skills/database/SKILL.md
```

Debe definir:

- Convenciones Prisma.
- Nombres de modelos.
- Nombres de relaciones.
- Campos obligatorios.
- Fechas de creación y actualización.
- Estados.
- Eliminación lógica.
- Índices.
- Restricciones únicas.
- Migraciones.
- Seeds.
- Dinero con Decimal.
- Transacciones.

## 10.5 Skill de seguridad

Ruta:

```text
skills/security/SKILL.md
```

Debe definir:

- Autenticación.
- Autorización.
- Roles.
- Permisos.
- Protección de secretos.
- Validación de recursos por propietario.
- Protección contra abuso.
- Auditoría.
- Gestión de errores.
- Reglas de contraseñas.
- Manejo de tokens.

## 10.6 Skill de testing

Ruta:

```text
skills/testing/SKILL.md
```

Debe definir:

- Pruebas unitarias.
- Pruebas de integración.
- Pruebas end-to-end.
- Pruebas de permisos.
- Pruebas de pagos.
- Pruebas de caja.
- Pruebas de generación de mensualidades.
- Pruebas de inventario.
- Datos de prueba.

## 10.7 Skill de DevOps

Ruta:

```text
skills/devops/SKILL.md
```

Debe definir:

- Docker.
- Docker Compose.
- Nginx.
- Variables de entorno.
- Redes internas.
- Volúmenes.
- Backups.
- Logs.
- Health checks.
- Desarrollo local.
- Producción.
- Despliegues.

## 10.8 Skill de integraciones

Ruta:

```text
skills/integrations/SKILL.md
```

Debe definir:

- Proveedores externos.
- Timeouts.
- Reintentos.
- Manejo de errores.
- Circuit breakers futuros.
- Protección de API keys.
- Adaptadores por proveedor.
- Registro de respuestas.
- Webhooks.

## 10.9 Skill de documentación

Ruta:

```text
skills/documentation/SKILL.md
```

Debe definir:

- Qué documentos se actualizan por cada cambio.
- Cómo redactar reglas de negocio.
- Cómo documentar endpoints.
- Cómo documentar decisiones.
- Cómo crear ADR.
- Cómo actualizar diagramas.
- Cómo documentar migraciones.
- Cómo mantener el README.

---

# 11. Variables de entorno

Archivo base:

```text
.env.example
```

Ejemplo:

```env
NODE_ENV=development
APP_NAME=IPTV Internet Platform
APP_PORT=3000
APP_URL=http://localhost

DATABASE_URL=postgresql://user:password@postgres:5432/iptv_db

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

DNI_API_URL=
DNI_API_TOKEN=

WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=

MAP_TILES_URL=
GEOCODING_API_URL=
GEOCODING_API_TOKEN=

FRONTEND_URL=http://localhost
API_BASE_PATH=/api/v1
```

Reglas:

- Nunca subir `.env` al repositorio.
- Mantener `.env.example` actualizado.
- Separar variables por entorno.
- Validar variables al iniciar el backend.
- No exponer claves privadas al frontend.

---

# 12. Docker y Nginx

## 12.1 Servicios

```text
nginx
frontend
backend
postgres
redis
```

## 12.2 Exposición de puertos

Solo Nginx:

```yaml
ports:
  - "80:80"
  - "443:443"
```

Los demás servicios utilizarán redes internas.

## 12.3 Rutas Nginx

```text
/        → frontend
/api/    → backend
/health  → backend health check
```

## 12.4 Entornos

Se deben mantener:

- `compose.yaml`.
- `compose.development.yaml`.
- `compose.production.yaml`.

## 12.5 Health checks

Debe verificarse:

- Backend disponible.
- PostgreSQL disponible.
- Redis disponible.
- Nginx disponible.

---

# 13. Convenciones de API

## 13.1 Respuesta exitosa

```json
{
  "success": true,
  "data": {},
  "message": "Operación completada"
}
```

## 13.2 Respuesta con error

```json
{
  "success": false,
  "error": {
    "code": "CLIENT_NOT_FOUND",
    "message": "El cliente no existe",
    "details": null
  }
}
```

## 13.3 Paginación

```text
?page=1
&limit=20
&search=juan
&sortBy=createdAt
&sortOrder=desc
```

## 13.4 Reglas

- Sustantivos en plural.
- API versionada.
- Errores con códigos.
- Validación de parámetros.
- Filtros consistentes.
- No devolver datos sensibles.
- Swagger actualizado.

---

# 14. Roles y permisos

Roles iniciales:

```text
ADMINISTRADOR
SECRETARIA_CAJA
TECNICO
INVENTARIO_VENTAS
```

Permisos de ejemplo:

```text
clientes.ver
clientes.crear
clientes.editar
clientes.eliminar

servicios.ver
servicios.crear
servicios.editar
servicios.cancelar

mensualidades.ver
mensualidades.generar
mensualidades.anular

pagos.ver
pagos.registrar
pagos.anular
pagos.imprimir

caja.abrir
caja.cerrar
caja.reabrir
caja.ver

inventario.ver
inventario.crear
inventario.ajustar

compras.ver
compras.crear

ventas.ver
ventas.crear

usuarios.ver
usuarios.crear
usuarios.editar

roles.ver
roles.editar

reportes.ver
reportes.exportar
```

La interfaz ocultará opciones según permisos, pero el backend siempre validará el permiso real.

---

# 15. Fases del proyecto

# Fase 1. Fundación técnica y arquitectura

## Objetivo

Construir toda la base técnica del proyecto antes de desarrollar módulos funcionales.

## Alcance

### Repositorio

- Crear monorepo.
- Configurar pnpm workspace.
- Crear `apps/frontend`.
- Crear `apps/backend`.
- Crear `packages` compartidos.
- Crear `docs`.
- Crear `skills`.
- Crear `infrastructure`.

### Frontend base

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- shadcn/ui.
- React Router.
- TanStack Query.
- React Hook Form.
- Zod.
- Layout administrativo.
- Menú lateral.
- Menú hamburguesa.
- Modo contraído.
- Header.
- Breadcrumbs.
- Página 404.
- Página de error.
- Sistema de notificaciones.
- Diseño responsive.

### Backend base

- NestJS.
- Configuración modular.
- API REST versionada.
- Swagger.
- Prisma.
- PostgreSQL.
- Redis.
- Validación global.
- Manejo global de errores.
- Logs.
- Health checks.
- Autenticación inicial.
- Roles y permisos base.
- Auditoría inicial.

### Prisma

- Configurar `schema.prisma`.
- Crear migración inicial.
- Crear seed inicial.
- Crear usuarios base.
- Crear roles base.
- Crear permisos base.

### Docker

- Dockerfile frontend.
- Dockerfile backend.
- Docker Compose.
- PostgreSQL.
- Redis.
- Nginx.
- Redes internas.
- Volúmenes.
- Variables de entorno.
- Health checks.

### Nginx

- Exponer únicamente 80 y 443.
- Enrutar frontend.
- Enrutar API.
- Configurar headers.
- Preparar HTTPS.

### Documentación

- README principal.
- Arquitectura.
- Convenciones.
- Guía de instalación.
- Guía de desarrollo.
- Guía de despliegue.
- Skills iniciales.
- ADR iniciales.

### Calidad

- ESLint.
- Prettier.
- Husky.
- Commitlint.
- Lint staged.
- Pruebas base.
- Pipeline CI inicial.

## Entregables

- Proyecto ejecutable con Docker.
- Nginx como único punto de entrada.
- Frontend base funcionando.
- Backend base funcionando.
- PostgreSQL conectado.
- Prisma conectado.
- Redis conectado.
- Login inicial.
- Swagger disponible.
- Roles y permisos base.
- Documentación inicial completa.

## Criterios de aceptación

- El sistema levanta con un solo comando.
- Solo Nginx publica puertos.
- Frontend consume la API REST.
- Backend se conecta a PostgreSQL mediante Prisma.
- Las variables se validan.
- La estructura de carpetas está completa.
- Las skills están creadas.
- Existe documentación de instalación y arquitectura.

---

# Fase 2. Núcleo del negocio

## Objetivo

Implementar la gestión de clientes, servicios, mensualidades, pagos e historial.

## Módulos

### Clientes

- Crear cliente.
- Editar cliente.
- Consultar cliente.
- Buscar cliente.
- Activar o desactivar cliente.
- Historial del cliente.

### Consulta por DNI

- Ingresar DNI.
- Consultar proveedor externo.
- Completar nombres y apellidos.
- Permitir corrección manual.
- Registrar errores de consulta.

### Direcciones

- Una o varias direcciones por cliente.
- Dirección principal.
- Referencia.
- Distrito.
- Provincia.
- Departamento.
- Latitud.
- Longitud.

### Mapas

- MapLibre GL JS.
- Mostrar ubicación.
- Seleccionar punto en mapa.
- Mover marcador.
- Guardar coordenadas.
- Ver clientes en mapa.

### Planes

- Plan IPTV.
- Plan internet.
- Precio.
- Descripción.
- Estado.
- Velocidad en internet.
- Televisores incluidos en IPTV.
- Precio adicional por televisor si corresponde.

### Servicios contratados

- Cliente.
- Dirección.
- Tipo de servicio.
- Plan.
- Precio mensual acordado.
- Fecha de alta.
- Estado.
- Observaciones.
- Cantidad de televisores en IPTV.

Estados:

```text
ACTIVO
SUSPENDIDO
CANCELADO
```

### Mensualidades

- Se generan según la fecha de alta.
- No se duplican.
- Cada mensualidad es independiente.
- Puede quedar pendiente aunque meses posteriores estén pagados.
- Estados: pendiente, parcial, pagado, anulado.
- Historial completo.

### Pagos

- Fecha actual.
- Selección de mensualidad.
- Pago total.
- Pago parcial.
- Método de pago.
- Usuario que cobró.
- Saldo restante.
- Ticket de pago.
- Anulación por permiso.

### Caja

- Apertura.
- Saldo inicial.
- Registro de ingresos.
- Registro de egresos.
- Cierre.
- Saldo esperado.
- Saldo contado.
- Diferencia.
- Reapertura con permiso.
- Motivo de reapertura.
- Historial de cierres.

### Contrato simple

- Datos del cliente.
- Dirección.
- Servicio.
- Plan.
- Precio.
- Fecha de alta.
- Condiciones básicas.
- Firma o aceptación.

### Ticket de pago

- Número.
- Cliente.
- Servicio.
- Periodo.
- Fecha.
- Importe.
- Saldo pendiente.
- Método de pago.
- Usuario que cobró.

### Reportes iniciales

- Clientes activos.
- Servicios activos.
- IPTV activos.
- Internet activo.
- Mensualidades pendientes.
- Pagos del día.
- Deuda total.
- Caja del día.

## Entregables

- Gestión completa de clientes.
- Gestión completa de direcciones.
- Consulta de DNI.
- Mapas.
- Planes.
- Servicios.
- Mensualidades.
- Pagos.
- Caja.
- Tickets.
- Contratos.
- Historial.

---

# Fase 3. Inventario, compras y ventas

## Objetivo

Incorporar control simple de materiales y productos.

## Inventario

- Productos.
- Categorías.
- Unidad de medida.
- Stock actual.
- Stock mínimo.
- Entradas.
- Salidas.
- Ajustes.
- Historial de movimientos.

Unidades:

```text
UNIDAD
METRO
ROLLO
CAJA
PAQUETE
```

Ejemplos:

- Cable por metro.
- RJ45 por unidad.
- Switch por unidad.
- Router por unidad.
- Conectores.

No se controlarán números de serie.

## Compras

- Proveedores.
- Fecha.
- Productos.
- Cantidad.
- Precio unitario.
- Total.
- Estado de pago.
- Ingreso automático al stock.

## Ventas

- Cliente opcional.
- Productos.
- Cantidad.
- Precio.
- Descuento.
- Total.
- Método de pago.
- Salida automática de stock.
- Movimiento de caja.

## Reportes

- Stock actual.
- Stock bajo.
- Entradas.
- Salidas.
- Compras.
- Ventas.
- Productos más vendidos.

## Entregables

- Inventario operativo.
- Compras operativas.
- Ventas operativas.
- Integración con caja.
- Reportes básicos.

---

# Fase 4. Técnicos y soporte

## Objetivo

Gestionar técnicos internos y órdenes de trabajo.

## Técnicos

- Registro de técnicos internos.
- Estado activo o inactivo.
- Datos de contacto.

## Órdenes de trabajo

Tipos:

```text
INSTALACION
REPARACION
SUSPENSION
RECONEXION
MANTENIMIENTO
VISITA_TECNICA
```

Campos:

- Cliente.
- Servicio.
- Dirección.
- Técnico.
- Fecha programada.
- Estado.
- Observaciones.
- Materiales utilizados.
- Fecha de cierre.

## Tickets de soporte

- Cliente.
- Servicio.
- Tipo de problema.
- Prioridad.
- Estado.
- Técnico asignado.
- Historial.

## Entregables

- Técnicos.
- Órdenes de trabajo.
- Tickets.
- Uso de materiales.
- Historial de atención.

---

# Fase 5. Comunicaciones

## Objetivo

Permitir el envío de mensajes al cliente.

## WhatsApp

- Confirmación de pago.
- Recordatorio de vencimiento.
- Aviso de deuda.
- Aviso de instalación.
- Aviso de visita técnica.

## Correo

- Ticket de pago.
- Contrato.
- Resumen de deuda.
- Avisos.

## Plantillas

- Plantillas editables.
- Variables dinámicas.
- Historial de envíos.
- Estado de envío.
- Error del proveedor.

## Redis

- Cola de mensajes.
- Reintentos.
- Control de tareas pendientes.

## Entregables

- WhatsApp integrado.
- Correo integrado.
- Plantillas.
- Historial de envíos.
- Procesamiento mediante colas.

---

# Fase 6. Reportes y dashboard gerencial

## Objetivo

Concentrar la información operativa y financiera.

## Dashboard

- Clientes activos.
- Clientes con deuda.
- Servicios por tipo.
- Pagos diarios.
- Pagos mensuales.
- Deuda total.
- Caja.
- Ventas.
- Compras.
- Stock bajo.
- Órdenes pendientes.

## Reportes

- Clientes.
- Servicios.
- Mensualidades.
- Deudas.
- Pagos.
- Caja.
- Inventario.
- Compras.
- Ventas.
- Técnicos.
- Órdenes.

## Exportaciones

- Excel.
- PDF.
- Impresión.

## Entregables

- Dashboard gerencial.
- Reportes.
- Filtros.
- Exportación.

---

# Fase 7. Portal del cliente

## Objetivo

Permitir que el cliente consulte su información.

## Funcionalidades

- Iniciar sesión.
- Ver sus servicios.
- Ver su plan.
- Ver mensualidades.
- Ver deudas.
- Ver pagos.
- Descargar tickets.
- Ver contrato.
- Crear ticket de soporte.
- Actualizar datos básicos.

El portal utilizará la misma API REST.

## Entregables

- Portal responsive.
- Seguridad por propiedad del recurso.
- Historial del cliente.
- Descarga de documentos.

---

# Fase 8. Landing page

## Objetivo

Crear una página pública comercial.

## Contenido

- Servicios.
- Planes.
- Cobertura.
- Contacto.
- Preguntas frecuentes.
- Formulario de solicitud.
- WhatsApp.
- Ubicación.

La landing page consumirá la misma API REST para datos públicos configurables.

---

# Fase 9. Mejoras futuras

Podrán evaluarse después:

- Aplicación móvil.
- PWA.
- Pagos en línea.
- Facturación electrónica.
- Corte automático.
- Reconexión automática.
- Múltiples sucursales.
- Varias cajas.
- Equipos por serie.
- Integraciones de red.
- Firma digital.
- Notificaciones push.

---

# 16. Modelo funcional simplificado

Entidades principales:

```text
Usuario
Rol
Permiso
UsuarioRol
RolPermiso
Auditoria

Cliente
Direccion
Plan
ServicioContratado
Mensualidad
Pago
Caja
SesionCaja
MovimientoCaja

Producto
Categoria
UnidadMedida
MovimientoInventario
Compra
DetalleCompra
Venta
DetalleVenta
Proveedor

Tecnico
TicketSoporte
OrdenTrabajo
MaterialOrdenTrabajo

PlantillaMensaje
MensajeEnviado
Configuracion
```

---

# 17. Reglas principales del negocio

## Clientes

- Un cliente puede tener varias direcciones.
- Un cliente puede tener varios servicios.
- Un servicio pertenece a una dirección.

## IPTV

- El plan define televisores incluidos.
- El servicio guarda la cantidad contratada.
- No se registra cada televisor individualmente.

## Internet

- El plan define velocidad y precio.
- No se controlan configuraciones técnicas avanzadas en la primera versión.

## Mensualidades

- Se generan según la fecha de alta.
- No deben duplicarse.
- Cada periodo conserva su propio estado.
- Una deuda antigua puede permanecer pendiente.
- Un mes posterior puede estar pagado.

## Pagos

- Se registran con fecha actual.
- El usuario selecciona la mensualidad.
- Se permiten pagos parciales.
- El saldo se actualiza automáticamente.
- Las anulaciones dependen de permisos.

## Caja

- Debe abrirse antes de registrar operaciones de caja.
- Debe cerrarse al final del turno.
- Puede reabrirse con permiso.
- Toda reapertura debe registrar motivo y usuario.

## Inventario

- No se controlan números de serie.
- Las compras incrementan stock.
- Las ventas reducen stock.
- Los ajustes requieren permiso.

---

# 18. Flujo de desarrollo

Cada funcionalidad debe seguir este orden:

1. Definir regla de negocio.
2. Documentar la regla.
3. Actualizar modelo Prisma.
4. Crear migración.
5. Crear endpoint.
6. Documentar endpoint.
7. Crear pruebas backend.
8. Crear interfaz frontend.
9. Crear pruebas frontend.
10. Validar permisos.
11. Actualizar documentación.
12. Cerrar historia de usuario.

---

# 19. Estrategia de ramas y commits

## Ramas

```text
main
staging
develop
feature/*
fix/*
refactor/*
docs/*
```

## Commits

```text
feat: agregar registro de clientes
fix: corregir cálculo de saldo
refactor: separar servicio de pagos
docs: documentar reglas de caja
test: agregar pruebas de mensualidades
chore: actualizar dependencias
```

---

# 20. Pruebas

## Backend

- Unitarias.
- Integración.
- End-to-end.
- Permisos.
- Transacciones.
- Pagos.
- Mensualidades.
- Caja.

## Frontend

- Componentes.
- Formularios.
- Navegación.
- Estados de error.
- Permisos visuales.

## Casos críticos

- Mensualidad duplicada.
- Pago parcial.
- Pago total.
- Pago de mes anterior.
- Pago de mes posterior con deuda previa.
- Anulación de pago.
- Cierre de caja.
- Reapertura de caja.
- Venta sin stock.
- Compra que incrementa stock.

---

# 21. Documentación obligatoria por módulo

Cada módulo debe incluir:

- Objetivo.
- Alcance.
- Reglas de negocio.
- Estados.
- Permisos.
- Entidades.
- Endpoints.
- Casos de uso.
- Errores.
- Pruebas.
- Pantallas.

---

# 22. Definición de terminado

Una funcionalidad se considera terminada cuando:

- La regla está documentada.
- El modelo está migrado.
- El endpoint funciona.
- El frontend funciona.
- Los permisos están aplicados.
- Los errores están controlados.
- Las pruebas pasan.
- Swagger está actualizado.
- La documentación está actualizada.
- La funcionalidad funciona en Docker.

---

# 23. Resultado esperado

Al finalizar todas las fases se tendrá una plataforma capaz de:

- Administrar clientes.
- Gestionar múltiples direcciones.
- Consultar datos por DNI.
- Mostrar ubicaciones en mapa.
- Gestionar IPTV e internet.
- Generar mensualidades.
- Registrar pagos parciales y totales.
- Mantener historial de deuda.
- Abrir, cerrar y reabrir caja.
- Imprimir tickets.
- Generar contratos simples.
- Controlar inventario.
- Registrar compras y ventas.
- Gestionar técnicos.
- Gestionar órdenes de trabajo.
- Enviar WhatsApp y correos.
- Generar reportes.
- Habilitar un portal del cliente.
- Publicar una landing page futura sobre la misma API REST.

---

# 24. Decisión técnica final

```text
Arquitectura: Monolito modular
API: REST versionada
Frontend: React + TypeScript + Vite
UI: Tailwind CSS + shadcn/ui
Estado servidor: TanStack Query
Formularios: React Hook Form + Zod
Mapas: MapLibre GL JS
Backend: NestJS + TypeScript
ORM: Prisma
Base de datos: PostgreSQL
Colas y caché: Redis
Proxy: Nginx
Contenedores: Docker Compose
Autorización: Roles y permisos granulares
Documentación API: Swagger / OpenAPI
```

La primera fase debe completarse correctamente antes de avanzar al núcleo funcional. Una base técnica ordenada permitirá desarrollar las siguientes fases con rapidez, estabilidad y menos errores.
