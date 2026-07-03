---
name: create-feature
description: Crea una feature de dominio en apps/web/src/features separando componentes, cliente de API tipado, tipos y helpers locales, sin duplicar componentes de src/components. Usa esta skill cuando se pida agrupar la logica de un dominio del frontend (farms, parcels, satellite, alerts, users), crear un modulo de UI por dominio, o cuando digan 'nueva feature', 'feature frontend', 'modulo de UI', 'agrupar dominio en web'. Para una vista suelta usa create-page.
---

# Crear feature frontend

## Cuando usar
Agrupar todo lo de un dominio de la UI (ej. `satellite`, `parcels`) para que las paginas solo compongan.

## Documentacion obligatoria (leer antes)
- `docs/05-frontend/architecture.md`
- `docs/05-frontend/state-management.md`
- El dominio relacionado en `docs/02-domain/`.

## Ubicacion y estructura
```
apps/web/src/features/<dominio>/
  components/     # UI propia del dominio
  api/            # cliente tipado hacia apps/api (contratos)
  types/          # tipos del dominio (o reusa packages/shared-types)
  hooks/          # hooks locales
  lib/            # helpers locales
```
Componentes verdaderamente reutilizables van a `apps/web/src/components/{ui,tables,maps,forms,layouts}`, no dentro de la feature.

## Reglas
- No duplicar lo que ya existe en `src/components`.
- Estado local primero; librerias globales solo con necesidad documentada (`state-management.md`).
- Cubrir estados de carga, error, vacio y sin permiso.

## Checklist antes de terminar
- [ ] Feature en `src/features/<dominio>`.
- [ ] Componentes / api / tipos / helpers separados.
- [ ] Sin duplicar componentes compartidos.
- [ ] Cuatro estados cubiertos.

## Anti-patrones
- Meter un componente generico dentro de una feature.
- Introducir un store global "por si acaso".


