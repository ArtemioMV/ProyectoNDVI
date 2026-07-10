# Skills externas instaladas

Fecha: 2026-07-07

## Instaladas en Codex

Ubicacion: `C:\Users\amarinv\.codex\skills`

### Prisma oficiales

- `prisma-cli`
- `prisma-client-api`
- `prisma-database-setup`

### Backend, seguridad y testing

- `nestjs-expert`
- `postgres-pro`
- `security-reviewer`
- `test-master`
- `typescript-pro`
- `react-expert`

### Frontend data/table

- `tanstack-query`
- `tanstack-table`

### Revision transversal

- `code-review-skill`

## Ya cubierto por skills disponibles en este entorno

- Documentos, contratos, tickets y reportes exportables: skill `documents` / `spreadsheets` ya disponible en Codex.
- Pruebas visuales y navegador local: skill `browser-use:browser` ya disponible en Codex.

## No instalado automaticamente

- `shadcn/ui` skill: la guia apunta a instalacion por CLI/documentacion de shadcn. Se aplicara cuando inicialicemos `components.json` y los componentes reales.
- Plugins `/plugin marketplace ...` de Claude/Anthropic: no corresponden directamente al runtime de Codex.
- Sentry: no es necesario instalarlo hasta entrar a observabilidad/produccion.
- Skills de DNI, WhatsApp y mapas: se mantienen cubiertas por `skills/integrations/SKILL.md` porque son reglas de dominio y proveedores concretos.

## Regla de prioridad

Las skills externas complementan el stack. Ante conflicto, mandan las skills propias del proyecto en `skills/`, especialmente reglas de mensualidades, pagos, caja, permisos, auditoria e integraciones protegidas en backend.