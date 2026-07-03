# Limites entre frontend, backend y worker

## Frontend: `apps/web`

Responsabilidades:

- Renderizar la interfaz.
- Manejar rutas, layouts, formularios, tablas y mapas.
- Mostrar estados de carga, error, vacio y sin permiso.
- Consumir la API mediante contratos tipados.
- Reflejar permisos visibles para mejorar experiencia.

No debe:

- Conectarse directo a PostgreSQL, Redis o MinIO.
- Decidir autorizacion final.
- Ejecutar procesamiento geoespacial pesado.
- Guardar secretos de servidor en codigo cliente.

## Backend: `apps/api`

Responsabilidades:

- Autenticacion y sesion.
- Organizacion activa y membresias.
- Permisos por accion y alcances de datos.
- Reglas de negocio.
- Auditoria.
- Persistencia.
- Publicacion de jobs en cola.
- Endpoints internos firmados para worker.

No debe:

- Confiar en `organization_id` enviado por el frontend como autoridad.
- Ejecutar procesos geoespaciales largos dentro del request HTTP.
- Exponer errores internos.

## Worker geoespacial: `services/geo-worker`

Responsabilidades:

- Procesar raster y geometria.
- Calcular indices como NDVI.
- Calcular estadisticas zonales.
- Guardar archivos grandes en MinIO/S3.
- Reportar resultados a la API.

No debe:

- Ser publico.
- Saltarse la API para modificar estado de negocio sin contrato interno.
- Perder contexto de organizacion, parcela, job y auditoria.


