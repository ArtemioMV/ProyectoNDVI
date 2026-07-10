---
name: integrations
description: Integraciones externas del sistema IPTV/Internet (consulta DNI, WhatsApp, correo, geocodificacion/mapas): adaptador por proveedor, timeouts, reintentos, manejo de errores, proteccion de API keys, registro de respuestas, webhooks y circuit breakers futuros. Usa esta skill al integrar o modificar un proveedor externo o un webhook. Se dispara con 'integracion', 'DNI', 'WhatsApp', 'correo', 'mapas', 'geocodificacion', 'API externa', 'webhook', 'proveedor'.
---

# Skill de integraciones

Cómo se consumen proveedores externos desde `apps/backend/src/infrastructure/{dni,whatsapp,mail,maps}`.

## Proveedores previstos
Consulta de DNI · WhatsApp · correo · geocodificación · proveedor de mapas · servicios futuros. **Todas las claves viven solo en el backend** (env).

## Adaptador por proveedor
- Definir una interfaz por capacidad (`DniProvider`, `WhatsappProvider`, `MailProvider`, `GeocodingProvider`) y una implementación por proveedor. El resto del sistema no conoce la API concreta.
- Cambiar de proveedor = nueva implementación del adaptador, sin tocar los casos de uso.

## Resiliencia
- **Timeouts** explícitos en toda llamada externa (no colgar el request).
- **Reintentos** con backoff para errores transitorios; distinguir transitorio (5xx/timeout) de definitivo (4xx de datos).
- **Circuit breaker** (futuro): abrir tras N fallos para no golpear un proveedor caído; degradar con mensaje claro.
- Nunca dejar el flujo del usuario colgado por un proveedor lento: si aplica, procesar en cola (Redis) y notificar.

## Errores y registro
- Mapear el error del proveedor a un `code` del sistema; no filtrar la respuesta cruda al cliente.
- Registrar la interacción (proveedor, endpoint, estado, latencia, correlación) para diagnóstico; sin guardar secretos ni datos sensibles innecesarios.

## Webhooks (entrantes)
- Verificar firma/origen antes de procesar. Idempotencia por referencia (no procesar el mismo evento dos veces).

## Checklist
- [ ] Adaptador con interfaz por capacidad; sin acoplar casos de uso.
- [ ] Timeout + reintentos con clasificación de error.
- [ ] API keys solo en env del backend.
- [ ] Registro de respuestas sin secretos.
- [ ] Webhooks verificados e idempotentes.

## Anti-patrones
- Llamar al proveedor sin timeout.
- Exponer la clave o la respuesta cruda al frontend.
- Procesar un webhook sin verificar origen ni idempotencia.
