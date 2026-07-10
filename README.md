# IPTV Internet Platform

Sistema web para administrar clientes, servicios de IPTV e internet, mensualidades, pagos, caja, inventario, soporte y reportes.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS.
- Backend: NestJS, TypeScript, Prisma, PostgreSQL.
- Infraestructura: Docker Compose, Nginx, Redis.

## Estructura

```text
apps/frontend     Aplicacion administrativa
apps/backend      API REST versionada
packages          Paquetes compartidos
docs              Documentacion tecnica y funcional
skills            Guias operativas por especialidad
infrastructure    Nginx, Docker y scripts
```

## Desarrollo local

1. Crear `.env` desde `.env.example`.
2. Instalar dependencias con `pnpm install`.
3. Levantar servicios con `docker compose up --build` (Docker carga `compose.override.yaml` de desarrollo automaticamente: volumenes con HMR y puerto de Postgres publicado).

Nginx es el unico punto de entrada publico:

- Frontend: `http://localhost`
- API: `http://localhost/api/v1`
- Health: `http://localhost/health`

## Regla base

El frontend nunca accede directamente a PostgreSQL. Toda operacion pasa por la API REST.

## Criterio de experiencia de usuario

- Las vistas de detalle rapido deben aprovechar el panel o modal actual sin derivar al usuario a otra pantalla cuando la accion puede resolverse en contexto.
- Los botones de navegacion completa, como `Ver todo`, deben quedar separados visualmente de las pestañas internas.
- Evitar repetir informacion: el resumen inicial muestra servicios; contrato debe mostrar datos del contrato, captacion, ubicacion, referencia o mapa.
- Los listados deben usar separadores consistentes: cuando se separan valores en una misma celda se usa `|`.
- Los iconos deben reforzar el tipo de dato o servicio: WiFi para internet y TV/monitor para IPTV.
## Skills del proyecto

Las reglas operativas del proyecto estan en `skills/<area>/SKILL.md`:

- `frontend`
- `ui-ux`
- `backend`
- `database`
- `security`
- `testing`
- `devops`
- `integrations`
- `documentation`

Antes de crear o modificar una funcionalidad, revisar la skill correspondiente. Ante conflicto con una skill externa o comunitaria, mandan las reglas propias del dominio: mensualidades, pagos parciales, caja, permisos, auditoria e integraciones protegidas en backend.

La curaduria de skills externas recomendadas quedo documentada en `docs/skills/external-skills-iptv-internet.md`.

Skills externas instaladas y estado de aplicacion: docs/skills/installed-external-skills.md.
