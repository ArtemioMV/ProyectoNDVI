# Permisos

Formato: `recurso.accion`.

Ejemplos canonicos:

- `organizations.read`
- `users.invite`
- `roles.assign`
- `parcels.read`
- `parcels.create`
- `parcels.update`
- `parcels.delete`
- `parcels.geometry.read`
- `parcels.geometry.create`
- `parcels.geometry.update`
- `parcels.geometry.delete`
- `satellite.ndvi.process`
- `satellite.ndvi.read`
- `reports.export`
- `audit.read`

Permisos post-MVP documentados pero diferidos:

- `projections.publish`
- `pruning.events.validate`

La unidad fisica interna para permisos es `parcels`, aunque la UI pueda mostrar Lote, Parcela, Cuartel o Bloque.



