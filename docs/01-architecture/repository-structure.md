# Estructura del repositorio

## Regla principal

Cada archivo vive dentro del contexto al que pertenece. Una configuracion especifica de la web no debe quedar en la raiz.

## Arbol base

- `apps/web`: Next.js.
- `apps/api`: NestJS.
- `services/geo-worker`: Python.
- `packages`: librerias compartidas solo cuando haya reutilizacion real.
- `infrastructure`: Docker, Nginx, database, MinIO y scripts.
- `docs`: fuente documental.
- `skills`: instrucciones reutilizables para agentes.


## Equivalencias de nombres

En conversaciones informales se puede decir frontend y backend, pero en el repositorio los nombres oficiales son:

| Concepto | Carpeta oficial | Motivo |
| --- | --- | --- |
| Frontend | `apps/web` | Es una aplicacion web Next.js dentro del monorepo. |
| Backend | `apps/api` | Es la API principal NestJS dentro del monorepo. |
| Procesamiento geoespacial | `services/geo-worker` | Es un servicio interno privado, no una app publica. |

No se deben crear carpetas `frontend/` ni `backend/` en la raiz. Duplicar nombres genera rutas ambiguas, configuraciones repetidas y errores de mantenimiento.

## Tailwind

Tailwind pertenece a `apps/web`:

- `apps/web/tailwind.config.ts`
- `apps/web/postcss.config.mjs`
- `apps/web/src/app/globals.css`
- `apps/web/components.json`

Solo se creara `packages/tailwind-config` si un ADR justifica compartir preset entre varias apps web.

