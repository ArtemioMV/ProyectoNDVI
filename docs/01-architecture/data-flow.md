# Flujo de datos

## Procesamiento NDVI

1. Usuario solicita procesamiento desde web.
2. API valida sesion, organizacion activa, permiso y alcance.
3. API crea trabajo y lo publica en Redis.
4. Worker procesa escena, recorta raster y calcula estadisticas.
5. Worker guarda objetos en MinIO/S3.
6. Worker reporta resultado a la API mediante endpoint interno firmado.
7. API registra metadatos, estadisticas y auditoria.
