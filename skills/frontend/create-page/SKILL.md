---
name: create-page
description: Crea una pagina Next.js en apps/web dentro del grupo de ruta correcto ((auth), (platform), (tenant) o api) cubriendo estados de carga, vacio, error y sin permiso. Usa esta skill cuando se pida crear una pagina, vista, pantalla o ruta del frontend/web, o cuando digan 'nueva pagina', 'new page', 'nueva vista', 'nueva pantalla', 'add route'. Para logica agrupada de un dominio usa create-feature; para tablas o formularios usa las skills especificas.
---

# Crear pagina frontend (Next.js)

## Cuando usar
Agregar una vista/ruta en `apps/web`. Si vas a agrupar componentes+API+tipos de un dominio, primero crea la **feature**.

## Documentacion obligatoria (leer antes)
- `docs/05-frontend/architecture.md`
- `docs/05-frontend/routing.md`
- `docs/01-architecture/frontend-backend-boundaries.md`
- `docs/06-design-system/principles.md`

## Grupos de ruta (elige el correcto)
- `apps/web/src/app/(auth)/` â€” login, invitacion, seleccion de organizacion.
- `apps/web/src/app/(platform)/` â€” administracion interna de plataforma.
- `apps/web/src/app/(tenant)/` â€” experiencia de la organizacion activa.
- `apps/web/src/app/api/` â€” endpoints internos de Next SOLO si son necesarios.

## Reglas
- Trabajar dentro de `apps/web` (nunca crear `frontend/` en raiz).
- Consumir la API por contratos tipados; nunca conectarse a Postgres/Redis/MinIO.
- Reflejar permisos en la UI, pero la seguridad final la decide la API.
- Cubrir SIEMPRE los cuatro estados: cargando, vacio, error, sin permiso.
- Reutilizar `src/components` en vez de duplicar.

## Estructura tipica
```
app/(tenant)/<recurso>/
  page.tsx           # server component: carga datos + permisos
  loading.tsx        # estado de carga (usa loading-state)
  error.tsx          # limite de error
```

## Checklist antes de terminar
- [ ] Pagina en el grupo de ruta correcto.
- [ ] Estados cargando / vacio / error / sin permiso resueltos.
- [ ] Sin acceso directo a servicios internos.
- [ ] Componentes reutilizados, no duplicados.
- [ ] Navegable por teclado (ver **accessibility-review**).

## Anti-patrones
- Poner secretos de servidor en el cliente.
- Asumir que ocultar un boton equivale a seguridad.


