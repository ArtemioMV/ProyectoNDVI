# Alcance inicial

## MVP delgado incluido

- Identidad, organizaciones, usuarios, membresias, roles, permisos y alcances.
- Fundos, parcelas canonicas (`parcel`), areas cultivables, campanas, cultivos y variedades.
- Mapa geoespacial con poligonos de parcela: dibujo, importacion, validacion e historial.
- Solicitud asincrona de procesamiento NDVI.
- Resultado NDVI por parcela y fecha, con metadatos, estadisticas y referencia a objetos MinIO/S3.
- Auditoria global de acciones sensibles.

## Diferido post-MVP

- Aplicacion movil y trabajo offline.
- Motor avanzado de contadores en cascada.
- Evaluaciones configurables completas.
- Proyecciones productivas semanales.
- Poda con pasadas, cohortes y eventos.
- Clima, riesgo sanitario, zonificacion y escenarios economicos.
- IoT, maquinaria, drones y automatizacion de riego.
- Facturacion SaaS automatica.
- Kubernetes y microservicios completos.

## Decision de nombre

La unidad fisica interna es `parcel` segun ADR-011. La etiqueta visible puede ser Lote, Parcela, Cuartel o Bloque por organizacion.



