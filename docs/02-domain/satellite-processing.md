# Procesamiento satelital

## Flujo

1. Consultar escenas disponibles.
2. Revisar nubosidad y calidad.
3. Solicitar procesamiento.
4. Ejecutar job asincrono.
5. Guardar raster/previews en MinIO/S3.
6. Guardar metadatos y estadisticas en PostgreSQL.

La arquitectura debe permitir NDVI, NDRE, NDMI, SAVI, EVI y otros indices.


