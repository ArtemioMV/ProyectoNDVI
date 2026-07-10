# Endpoints de servicios y planes

Todas las rutas viven bajo `/api/v1`.

## Planes

### GET `/planes`

Lista planes comerciales de Internet e IPTV.

Query:

- `type`: `INTERNET` o `TV`.

Respuesta:

```json
{ "success": true, "data": [] }
```

### POST `/planes`

Crea un plan comercial.

Permiso previsto: `servicios.crear`.

Campos principales:

- `type`
- `name`
- `description`
- `monthlyPrice`
- `downloadMbps` para Internet
- `uploadMbps` para Internet
- `maxScreens` para IPTV

## Separacion con clientes

Clientes consume estos planes para registrar servicios contratados. La administracion de planes no vive dentro de Clientes.
