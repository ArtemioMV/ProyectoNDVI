---
name: frontend
description: Como trabajar el frontend del sistema IPTV/Internet: React + Vite + Tailwind + shadcn/ui + TanStack Query + React Hook Form + Zod + React Router + MapLibre, con organizacion por modulo, estados de carga/error, permisos visuales y consumo de la API REST. Usa esta skill al crear o modificar cualquier parte de apps/frontend: modulos, paginas, formularios, tablas, filtros, mapas, o al consumir endpoints. Se dispara con 'frontend', 'React', 'pagina', 'formulario', 'tabla', 'componente', 'MapLibre', 'consumir API'.
---

# Skill de frontend

Cómo se trabaja el frontend en `apps/frontend`. La seguridad real vive en el backend; aquí el control de permisos es solo visual.

## Stack
React · TypeScript · Vite · Tailwind · shadcn/ui · TanStack Query · React Hook Form · Zod · React Router · MapLibre GL · cliente HTTP centralizado (Axios).

## Organización por módulo
Cada dominio vive en `src/modules/<modulo>/` con:
```
api/  components/  hooks/  pages/  schemas/  types/  utils/  index.ts
```
Componentes globales reutilizables en `src/components/{ui,forms,tables,feedback,navigation,charts}`. Cliente HTTP y auth en `src/services/{api,auth,integrations}`.

## Cómo crear un módulo / página
1. Crear la carpeta del módulo con la estructura de arriba.
2. Página en `pages/`, montada en el router (`src/app/router`) con su guard de permiso.
3. Datos SIEMPRE vía TanStack Query desde `api/` (nunca `fetch`/`axios` dentro de un componente visual).
4. Cubrir los cuatro estados: cargando, vacío, error, sin permiso.

## Formularios (React Hook Form + Zod)
- Esquema Zod en `schemas/`; `useForm({ resolver: zodResolver(schema) })`.
- Mapear el error de la API (`error.code` / `error.details`) a cada campo; error general solo si no hay campo.
- Deshabilitar el submit mientras envía.

## Consumo de la API
- Respuesta estándar: `{ success, data, message }` en éxito; `{ success:false, error:{ code, message, details } }` en error. El cliente HTTP central desempaqueta `data` y normaliza el error.
- Paginación de tablas: `?page&limit&search&sortBy&sortOrder`. Toda tabla pagina.

## Permisos (solo visual)
- Ocultar/mostrar acciones y menú según permisos (`clientes.crear`, `pagos.registrar`, …). El backend valida el permiso real; ocultar un botón NO es seguridad.
- El menú soporta modo expandido y contraído; la navegación visible depende de permisos.

## MapLibre GL
- Componentes de mapa en `components/charts` o en el módulo (`direcciones`).
- Separar visualización de persistencia: marcar un punto no lo guarda hasta que la API lo confirma.

## Nombres de archivos
- Componentes `PascalCase.tsx`, hooks `useAlgo.ts`, esquemas `algo.schema.ts`, tipos `algo.types.ts`.

## Checklist
- [ ] Lógica dentro del módulo; sin HTTP en componentes visuales.
- [ ] TanStack Query para datos; RHF+Zod para formularios.
- [ ] Estados cargando/vacío/error/sin permiso.
- [ ] Tablas paginadas y responsive.
- [ ] Permisos aplicados en menú y acciones.

## Anti-patrones
- `axios`/`fetch` directo en un componente de UI.
- Asumir que ocultar un botón protege la acción.
- Tablas sin paginación; pantallas saturadas de tarjetas.
