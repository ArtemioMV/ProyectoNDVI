---
name: create-form
description: Crea un formulario en apps/web con validacion en cliente para experiencia y mapeo de errores de API por campo, cubriendo estados de envio, error y exito. Usa esta skill cuando se pida crear o mejorar un formulario, form, pantalla de captura, alta/edicion de datos o validacion de inputs en el frontend, o cuando digan 'nuevo formulario', 'create form', 'formulario de', 'validar campos'. La seguridad real la valida la API, no el formulario.
---

# Crear formulario (frontend)

## Cuando usar
Capturar/editar datos en la web con validacion y manejo de errores de API.

## Documentacion obligatoria (leer antes)
- `docs/05-frontend/forms.md`
- `docs/05-frontend/accessibility.md`
- `docs/06-design-system/components.md`

## Ubicacion
Formularios reutilizables en `apps/web/src/components/forms/`; formularios propios de un dominio en `apps/web/src/features/<dominio>/components/`.

## Reglas
- Validar en cliente para experiencia (feedback inmediato).
- Mapear errores de API a cada campo cuando sea posible; mostrar error general solo si no hay campo.
- La validacion frontend NO es seguridad: la autoridad es la API.
- Cubrir estados: enviando, error, exito. Deshabilitar el submit mientras envia.
- Labels asociadas, foco y navegacion por teclado accesibles.

## Patron de manejo de errores de API
```ts
// La API responde error normalizado {code, message, fields?}
if (res.error?.fields) setFieldErrors(res.error.fields);
else setFormError(res.error?.message ?? 'Ocurrio un error');
```

## Checklist antes de terminar
- [ ] Validacion cliente + mapeo de errores por campo.
- [ ] Estados enviando / error / exito.
- [ ] Submit bloqueado durante el envio.
- [ ] Accesible por teclado, labels correctas.

## Anti-patrones
- Confiar en la validacion del cliente como control de seguridad.
- Tragar el error de la API y mostrar un mensaje generico siempre.


