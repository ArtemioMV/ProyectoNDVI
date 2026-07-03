---
name: accessibility-review
description: Revision de accesibilidad: navegacion por teclado, contraste, etiquetas accesibles, foco visible y estados que no dependen solo del color. Usa esta skill cuando se pida revisar accesibilidad, verificar a11y, chequear navegacion por teclado o contraste, o cuando digan 'revisa accesibilidad', 'accessibility review', 'a11y', 'es accesible', 'contraste y teclado'.
---

# Revision de accesibilidad

## Cuando usar
Al revisar una vista/feature del frontend para asegurar uso por teclado y lectores.

## Documentacion de referencia
- `docs/05-frontend/accessibility.md`

## Revisar primero
- **Navegacion por teclado** â€” todo lo interactivo es alcanzable y operable con teclado.
- **Foco visible** â€” el indicador de foco no se elimina.
- **Contraste** suficiente en texto y controles.
- **Etiquetas accesibles** en controles criticos (labels, roles, nombres).
- **Estados no dependientes solo del color** (usar icono/texto ademas del color; relevante en mapas, alertas y tablas).

## Senales de rechazo (bloqueantes)
- Accion critica inalcanzable por teclado.
- Estado (error/alerta) comunicado unicamente por color.

## Como reportar
Por control: barrera -> a quien afecta -> correccion concreta.


