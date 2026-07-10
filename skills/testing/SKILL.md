---
name: testing
description: Estrategia de pruebas del sistema IPTV/Internet: unitarias, integracion, e2e, y casos criticos de permisos, pagos, caja, generacion de mensualidades e inventario, con datos de prueba aislados. Usa esta skill al escribir o revisar tests del backend o frontend, o al cubrir un caso critico de negocio. Se dispara con 'test', 'prueba', 'testing', 'unit', 'integracion', 'e2e', 'cobertura', 'caso critico'.
---

# Skill de testing

Qué y cómo se prueba. Los casos financieros y de permisos son obligatorios.

## Niveles
- **Unitarias**: reglas puras de casos de uso (cálculo de saldo, prorrateo, generación de periodo) con dependencias mockeadas.
- **Integración**: endpoints con base real de prueba: validación, permisos, transacciones, formato de respuesta.
- **E2E**: flujos completos (login → registrar pago → imprimir ticket; abrir caja → operar → cerrar).

## Casos críticos obligatorios
- **Permisos**: un rol sin `pagos.registrar` no puede registrar; sin `caja.reabrir` no reabre.
- **Pagos**: pago parcial actualiza el saldo; no se sobre-aplica; anulación exige permiso y audita.
- **Caja**: no se registran operaciones de caja sin caja ABIERTA; reapertura guarda motivo y usuario.
- **Mensualidades**: la generación **no duplica** el periodo (único por servicio+periodo); respeta la fecha de alta; una deuda antigua puede quedar pendiente mientras un mes posterior está pagado.
- **Inventario**: compra incrementa stock, venta lo reduce, ajuste exige permiso; stock nunca negativo sin control.

## Datos de prueba
- Fixtures pequeños y deterministas; base aislada por corrida; no depender de datos reales.
- Frontend: pruebas de componentes clave (formularios con Zod, estados de carga/error) y de guards de permiso.

## Checklist
- [ ] Unit + integración + e2e de lo tocado.
- [ ] Caso de permiso denegado incluido.
- [ ] Pago/caja/mensualidad/inventario cubiertos si aplica.
- [ ] Datos aislados; sin dependencias reales.

## Anti-patrones
- Probar solo el camino feliz.
- Tests financieros sin verificar saldos ni transacción.
- Depender de un dump de producción.
