# Servicios y planes

## Objetivo

Administrar los planes comerciales que luego se asignan a los clientes como servicios contratados.

## Separacion funcional

- `Servicios` contiene planes de Internet e IPTV.
- `Clientes` no crea planes; solo selecciona planes existentes al registrar servicios contratados.
- Internet y TV viven dentro de Servicios como tipos de plan.
- Un plan puede estar activo o inactivo.
- El precio mensual del plan se guarda con `Decimal`.

## Reglas

- Un plan de Internet define velocidad de bajada y subida.
- Un plan IPTV define cantidad maxima o incluida de pantallas.
- No se registra cada televisor individualmente.
- El cliente puede contratar Internet, IPTV o ambos.
- La cantidad de pantallas contratadas se guarda en el servicio del cliente.

## Endpoints

- `GET /api/v1/planes`
- `GET /api/v1/planes?type=INTERNET`
- `GET /api/v1/planes?type=TV`
- `POST /api/v1/planes`
