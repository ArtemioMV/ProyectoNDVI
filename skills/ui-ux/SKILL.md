---
name: ui-ux
description: Sistema visual y criterios de UX del panel administrativo IPTV/Internet: tipografia, espaciado, jerarquia, colores, estados de botones y formularios, tablas, filtros, navegacion expandible, responsive, accesibilidad, uso correcto de tarjetas y criterios del dashboard gerencial. Usa esta skill al disenar o revisar pantallas, componentes visuales, el dashboard o la navegacion. Se dispara con 'UI', 'UX', 'diseno', 'dashboard', 'tabla', 'estilo', 'responsive', 'accesibilidad', 'tarjetas'.
---

# Skill de UI/UX

Criterios visuales del panel. Interfaz operativa (gestión de clientes, pagos, caja), no marketing. Densidad útil, sin saturar.

## Sistema visual
- Base shadcn/ui + Tailwind. Un único set de tokens (colores, radios, sombras) reutilizado; nada de estilos sueltos por pantalla.
- Tipografía con jerarquía clara (título de página > sección > contenido); tamaños consistentes.
- Espaciado por escala de Tailwind; ritmo vertical uniforme.

## Colores y estados
- Paleta con semántica: primario (acción), éxito, advertencia, error, neutro. Estados de servicio/pago comunicados con icono + texto, nunca solo color.
- Botones con estados visibles: normal, hover, activo, deshabilitado, cargando.
- Formularios con estados: normal, foco, error (mensaje bajo el campo), éxito, enviando.

## Tablas y filtros
- Tablas densas y legibles; acciones por fila según permiso. Paginación siempre.
- Filtros consistentes (búsqueda, rango de fecha, estado) alineados arriba de la tabla.

## Navegación
- Menú lateral con modo expandido y contraído. Ítems visibles según permisos.
- Rutas claras por módulo; breadcrumb en vistas profundas.

## Responsive y accesibilidad
- Responsive real: la tabla no rompe en móvil (scroll o vista compacta).
- Navegable por teclado, foco visible, labels asociadas, contraste AA.

## Tarjetas
- Usar tarjetas para agrupar, no para decorar. Evitar tarjetas anidadas y pantallas llenas de tarjetas sin datos.

## Dashboard gerencial
- Cada widget responde a una decisión (ingresos del día, mora, altas, caja abierta).
- Mostrar periodo y fecha del dato. Comparaciones claras. Sin adornos que no aporten.

## Checklist
- [ ] Tokens únicos reutilizados; sin estilos ad-hoc.
- [ ] Estados de botón y formulario completos.
- [ ] Tablas paginadas, filtros consistentes, responsive.
- [ ] Teclado/foco/contraste OK; estado no solo por color.
- [ ] Dashboard accionable, sin saturación.

## Anti-patrones
- Comunicar un estado solo con color.
- Tarjetas anidadas o dashboard decorativo.
- Estilos inline que rompen el sistema visual.
