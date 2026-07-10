# ADR-002: Generacion e impresion de contratos

## Estado
Aceptada (recomendacion).

## Contexto
Al registrar/gestionar un cliente se debe generar un **contrato** que se vea bien y
se pueda **imprimir/descargar**. Debe usar los datos de la empresa (logo, nombre,
direccion) que se administran desde el panel de configuracion.

## Decision
Usar **plantilla HTML + CSS** como fuente unica, y de ahi:
- **Imprimir/guardar PDF** con el dialogo del navegador (`window.print()` + CSS `@media print`)
  para la version rapida en el front.
- Cuando se requiera PDF generado en servidor (envio por correo/WhatsApp, archivado),
  renderizar la misma plantilla con **Puppeteer** (Chromium headless) en el backend.

## Alternativas descartadas
- **Construir el PDF a mano** (pdf-lib/PDFKit): mucho trabajo de maquetado, dificil de
  mantener y de hacer "hermoso".
- **Canva u otras herramientas de imagen**: son para graficos, no para documentos con
  datos dinamicos.

## Consecuencias
- Una sola plantilla HTML sirve para vista previa, impresion y PDF server-side.
- Reusa la marca (`config/branding.ts` -> futuro modulo de settings) sin duplicar estilos.
- El "avance del contrato" se puede previsualizar en vivo en la pantalla de alta.
