---
name: empty-state
description: Disena estados vacios que explican brevemente la situacion y ofrecen la accion principal solo si el usuario tiene permiso, sin texto instructivo largo. Usa esta skill cuando una vista, tabla, lista o panel pueda no tener datos, cuando se pida disenar el 'empty state', o cuando digan 'estado vacio', 'sin datos', 'empty state', 'no hay resultados'. Parte del set de estados obligatorios junto con loading-state.
---

# Estado vacio

## Cuando usar
Cualquier vista/tabla/lista/mapa que pueda no tener datos todavia.

## Documentacion de referencia
- `docs/06-design-system/components.md`

## Reglas
- Explicar el estado de forma breve (por que esta vacio).
- Ofrecer la accion principal SOLO si el usuario tiene permiso para ejecutarla.
- Evitar texto largo o instructivo innecesario.
- Diferenciar "sin datos aun" de "sin permiso" y de "error".

## Checklist antes de terminar
- [ ] Mensaje corto y claro.
- [ ] CTA condicionada por permiso.
- [ ] No confundir vacio con error o sin permiso.

## Anti-patrones
- Mostrar un boton de accion que el usuario no puede usar.
- Parrafos de instrucciones en el vacio.


