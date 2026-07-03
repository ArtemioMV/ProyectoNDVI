---
name: validate-geometry
description: Valida geometria antes de guardarla o procesarla: SRID 4326, cierre, area mayor que cero, auto-intersecciones y superposiciones relevantes, registrando historial de cambios. Usa esta skill cuando se pida validar geometria, chequear un poligono, detectar superposiciones o geometrias invalidas, o cuando digan 'validar geometria', 'validate geometry', 'geometria invalida', 'overlap de parcelas', 'poligono valido'. Aplica tanto en geo-worker como antes de persistir en API/PostGIS.
---

# Validar geometria

## Cuando usar
Antes de guardar o procesar cualquier geometria de parcela/area/parcela.

## Documentacion obligatoria (leer antes)
- `docs/03-database/spatial-model.md`
- `docs/02-domain/farms-parcels.md`

## Reglas de validacion
- SRID 4326 y tipo MultiPolygon.
- Anillo cerrado, sin auto-intersecciones.
- Area calculada con PostGIS mayor que cero.
- Detectar superposiciones relevantes con geometrias vecinas de la misma organizacion.
- Conservar area declarada cuando el negocio la requiera, aparte del area calculada.
- Registrar historial de cambios de geometria (no sobrescribir sin rastro).

## Ubicacion
- Worker: `services/geo-worker/src/processing/` (pre-procesamiento).
- API: validacion final antes de persistir (PostGIS es la autoridad).

## Checklist antes de terminar
- [ ] SRID/tipo/cierre/area verificados.
- [ ] Auto-intersecciones y superposiciones detectadas.
- [ ] Historial de geometria registrado.
- [ ] Fixtures con casos validos e invalidos.

## Anti-patrones
- Guardar geometria "confiando" en el cliente.
- Sobrescribir geometria sin conservar historial.


