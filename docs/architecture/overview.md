# Arquitectura general

La plataforma inicia como monolito modular con frontend React, API REST NestJS, PostgreSQL mediante Prisma y Redis para colas o tareas temporales.

## Flujo principal

```text
Usuario -> Nginx -> Frontend React -> API REST NestJS -> Prisma -> PostgreSQL
```

## Reglas

- Solo Nginx expone puertos publicos.
- El frontend consume `/api/v1`.
- El backend concentra reglas de negocio, permisos, auditoria e integraciones.
- PostgreSQL y Redis permanecen en red interna.
