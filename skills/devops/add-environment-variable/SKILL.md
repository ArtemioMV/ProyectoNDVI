---
name: add-environment-variable
description: Agrega una variable de entorno nueva con valor dummy en .env.example, documentando uso, obligatoriedad y ambiente, y validando su presencia al arranque si es critica. Usa esta skill cuando se introduzca una env var, secreto de configuracion o clave nueva, o cuando digan 'nueva variable de entorno', 'add env var', 'configurar secreto', 'nueva config'. Nunca commitea secretos reales.
---

# Agregar variable de ambiente

## Cuando usar
Introducir cualquier configuracion o secreto nuevo consumido por web, api o geo-worker.

## Documentacion obligatoria (leer antes)
- `docs/08-security/secrets.md`
- `docs/07-devops/environments.md`

## Reglas
- Agregar la clave en `.env.example` con un valor DUMMY (nunca el real).
- Documentar: para que sirve, si es obligatoria y en que ambiente aplica.
- Si es critica, validar su presencia al arranque y fallar rapido si falta.
- No commitear `.env` reales. Si un secreto se filtro: rotar y registrar el incidente.

## Referencia (claves ya existentes en `.env.example`)
`DATABASE_URL`, `REDIS_URL`, `MINIO_ENDPOINT/ACCESS_KEY/SECRET_KEY/BUCKET`, `INTERNAL_WORKER_CALLBACK_SECRET`, `JWT_SECRET`, `WEB_PUBLIC_URL`, `API_PUBLIC_URL`. Sigue el mismo estilo de nombres (MAYUSCULAS_CON_GUION_BAJO).

## Checklist antes de terminar
- [ ] Dummy en `.env.example`.
- [ ] Uso, obligatoriedad y ambiente documentados.
- [ ] Validacion de presencia al arranque si es critica.
- [ ] Ningun secreto real en el repo.

## Anti-patrones
- Poner el valor real "temporalmente".
- Leer la variable en el cliente (frontend) cuando es un secreto de servidor.


