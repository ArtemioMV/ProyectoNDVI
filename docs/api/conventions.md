# Convenciones de API

## Base

- Prefijo: `/api/v1`.
- Recursos en plural.
- Respuestas JSON consistentes.
- Swagger disponible en `/api/docs`.

## Respuesta exitosa

```json
{
  "success": true,
  "data": {},
  "message": "Operacion completada"
}
```

## Respuesta de error

```json
{
  "success": false,
  "error": {
    "code": "CLIENT_NOT_FOUND",
    "message": "El cliente no existe",
    "details": null
  }
}
```
