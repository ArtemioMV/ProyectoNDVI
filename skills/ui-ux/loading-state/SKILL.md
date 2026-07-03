---
name: loading-state
description: Disena estados de carga que mantienen dimensiones estables, no desplazan el layout y diferencian carga inicial de actualizacion parcial. Usa esta skill cuando se pida disenar el estado de carga, skeletons, spinners o placeholders, o cuando digan 'estado de carga', 'loading', 'skeleton', 'spinner', 'cargando'. Parte del set de estados obligatorios junto con empty-state.
---

# Estado de carga

## Cuando usar
Al mostrar datos que tardan (listados, mapas, resultados de jobs).

## Documentacion de referencia
- `docs/06-design-system/components.md`

## Reglas
- Mantener dimensiones estables (skeleton del tamano del contenido real).
- No desplazar el layout innecesariamente (evitar saltos / CLS).
- Diferenciar carga INICIAL (skeleton) de actualizacion PARCIAL (indicador sutil, sin ocultar lo ya cargado).

## Checklist antes de terminar
- [ ] Skeleton preserva el layout final.
- [ ] Sin saltos de contenido.
- [ ] Carga inicial vs. refresco parcial diferenciados.

## Anti-patrones
- Reemplazar toda la vista por un spinner en cada refresco.
- Skeletons de tamano distinto al contenido, que provocan saltos.


