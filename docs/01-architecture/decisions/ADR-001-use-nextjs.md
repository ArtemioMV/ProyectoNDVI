# ADR-001: Usar Next.js para la web

- Estado: Aprobado inicial
- Fecha: 2026-07-03
- Responsable: Equipo de plataforma

## Contexto

La plataforma necesita una aplicacion web centralizada con rutas, layouts, renderizado eficiente y TypeScript.

## Decision

Usar Next.js con React y TypeScript para `apps/web`.

## Consecuencias

- La configuracion web vive en `apps/web`.
- El frontend no accede directamente a la base de datos.
- La autorizacion final vive en la API.
