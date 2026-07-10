# Skills externas de GitHub — Sistema IPTV/Internet

Curaduría alineada a **tu stack real** del plan maestro: NestJS + Prisma + PostgreSQL + Redis + Swagger (backend); React + Vite + Tailwind + shadcn/ui + TanStack Query + React Hook Form + Zod + React Router + MapLibre (frontend). Verificadas en GitHub.

> Complementan tus 9 skills propias (`skills/frontend`, `backend`, …), que codifican TU dominio (mensualidades, caja, pagos parciales, permisos `recurso.accion`). Las externas aportan best-practices genéricas del stack. Ante conflicto de reglas de negocio, mandan las tuyas.

## Ruta e instalación

Todas van en `<repo>/.claude/skills/<nombre>/SKILL.md` (proyecto) o `~/.claude/skills/` (global). Métodos:

```bash
npx skills add https://github.com/<owner>/<repo> --skill "<nombre>"   # comunitarias
/plugin marketplace add <owner>/<repo>                                # marketplaces
git clone <repo> tmp && cp -r tmp/<skill> .claude/skills/             # manual
```

**Seguridad:** ejecutan código. Prioriza oficiales (Anthropic, Prisma, shadcn, Sentry). Comunitarias: lee su `SKILL.md` y revisa el último commit antes de producción.

---

## Mapa: necesidad del plan → mejor skill

### Frontend (10.1) — React/Vite/shadcn/TanStack/RHF/Zod

- **shadcn/ui (oficial)** — `https://ui.shadcn.com/docs/skills`. Lee tu `components.json` (framework, aliases, componentes instalados) y genera código correcto a la primera; documenta integración **React Hook Form + Zod**. Es tu librería de UI exacta. Instalar con la CLI de shadcn (ver esa página).
- **TanStack skills** — `https://github.com/tanstack-skills/tanstack-skills`. Query, Router y Start. Usas **TanStack Query**.
  ```bash
  /plugin marketplace add tanstack-skills/tanstack-skills
  /plugin install tanstack-query@tanstack-skills
  /plugin install tanstack-router@tanstack-skills
  ```
- **frontend-design (Anthropic)** — `github.com/anthropics/skills` → `example-skills`. Anti-"AI slop"; sirve para panel/dashboards, no solo landings.

### UI/UX (10.2)

- **jezweb/claude-skills → frontend plugin** — `https://github.com/jezweb/claude-skills`. Incluye `shadcn-ui`, `tailwind-theme-builder`, `react-patterns`, `design-review`, `design-system`. Útil para tu sistema visual y el dashboard gerencial.
- (Solo **Fase 8 Landing**) `landing-page` del mismo repo, o **taste-skill** (`Leonxlnx/taste-skill`) — SOLO para la landing pública comercial; NO para el panel.

### Backend (10.3) — NestJS

- **nestjs-expert** — `https://github.com/Jeffallan/claude-skills` (`--skill nestjs-expert`, ~9.7k ⭐). Módulos, controllers, services, DI, DTOs, guards, interceptors, JWT/Passport, **Swagger**, Prisma, Jest/Supertest. Aquí SÍ aplica (tu backend es NestJS).
  ```bash
  npx skills add https://github.com/Jeffallan/claude-skills --skill nestjs-expert
  ```

### Base de datos (10.4) — Prisma/PostgreSQL

- **Prisma (oficial)** — `https://github.com/prisma/skills`. `prisma-schema`, `prisma-client-api`, `prisma-cli`, `prisma-upgrade-v7`.
  ```bash
  npx skills add prisma/skills --skill prisma-schema
  npx skills add prisma/skills --skill prisma-client-api
  ```
- **postgres-pro** — `https://github.com/Jeffallan/claude-skills` (`--skill postgres-pro`). EXPLAIN, índices, tuning; útil para consultas de reportes/caja.

### Seguridad (10.5)

- **security-reviewer** — `https://github.com/Jeffallan/claude-skills` (`--skill security-reviewer`). Refuerza tu skill de seguridad (secretos, autorización, validación).

### Testing (10.6)

- **webapp-testing (Anthropic)** — `github.com/anthropics/skills` → `example-skills`. Playwright para e2e del panel.
- **test-master** — `https://github.com/Jeffallan/claude-skills` (`--skill test-master`). Estrategia unit/integration/e2e.

### DevOps (10.7)

- **Sentry (oficial)** — `getsentry/sentry-node-sdk` (backend NestJS/Node) y `getsentry/sentry-react-sdk` (panel). Observabilidad de errores.
- Docker/Nginx/Compose no tienen una skill pública que supere a tu propia skill de devops; usa la tuya.

### Integraciones (10.8) — DNI/WhatsApp/correo/mapas

- **No hay skills públicas** de consulta DNI (RENIEC-style), WhatsApp Business ni geocodificación específicas que valgan la pena. Tu skill de integraciones (adaptador + timeout + retries + keys en backend) lo cubre. Si usas colas Redis para envíos, revisa una skill **BullMQ specialist** (verifica último commit antes de instalar).

### Documentación (10.9)

- **document-skills (Anthropic)** — `github.com/anthropics/skills` → `pdf`, `xlsx`. Para **ticket de pago / contrato en PDF** y **reportes exportables** sin gastar tokens.
  ```bash
  /plugin marketplace add anthropics/skills
  /plugin install document-skills@anthropic-agent-skills
  ```

### Code review (transversal, bonus)

- **code-review-skill** — `https://github.com/awesome-skills/code-review-skill`. Una sola skill con guías por lenguaje que incluyen **React 19 + TanStack Query v5** y **NestJS (DI, Guards, Interceptors, DTOs)** + TypeScript. Cubre tus dos lados en un solo review.

---

## Set mínimo recomendado (no instales de más)

```bash
# Oficiales
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills     # PDF de tickets/contratos, Excel de reportes
/plugin install example-skills@anthropic-agent-skills      # frontend-design, webapp-testing
npx skills add prisma/skills --skill prisma-schema
npx skills add prisma/skills --skill prisma-client-api
/plugin marketplace add tanstack-skills/tanstack-skills
/plugin install tanstack-query@tanstack-skills
# shadcn/ui: instalar con la CLI de shadcn (ui.shadcn.com/docs/skills) para que lea tu components.json

# Comunidad (revisar SKILL.md + último commit)
npx skills add https://github.com/Jeffallan/claude-skills --skill nestjs-expert
npx skills add https://github.com/Jeffallan/claude-skills --skill postgres-pro
npx skills add https://github.com/awesome-skills/code-review-skill
```

Añade `webapp-testing`, `test-master`, `security-reviewer` y Sentry al entrar a testing/estabilización.

---

## Descartadas (por qué)

| Skill | Motivo |
|---|---|
| taste-skill (uso general) | Solo landing/portafolio; tu core es panel admin. Úsala SOLO en la Fase 8 (landing). |
| auth0-fastify / Auth0 | Tu backend es **NestJS con JWT propio**, no Fastify/Auth0. |
| Skills de Drizzle/TypeORM, otros lenguajes | Usas Prisma + TS/React. Fuera de stack. |
| Packs de 130–400 skills | Ruido + superficie de seguridad. Instala puntual. |

## Sin skill pública (lo cubren tus skills propias)

MapLibre GL, consulta DNI, WhatsApp Business, caja/mensualidades/pagos parciales (dominio). No importes nada genérico para eso: tu carpeta `skills/` ya lo resuelve con tus reglas.
