import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const permissions = [
  "clientes.ver",
  "clientes.crear",
  "clientes.editar",
  "servicios.ver",
  "mensualidades.ver",
  "mensualidades.generar",
  "pagos.ver",
  "pagos.registrar",
  "pagos.imprimir",
  "pagos.anular",
  "metodos-pago.ver",
  "metodos-pago.editar",
  "usuarios.ver",
  "usuarios.crear",
  "usuarios.editar",
  "roles.ver",
  "roles.editar",
  "contratos.generar",
  "caja.ver",
  "caja.abrir",
  "caja.cerrar",
  "caja.reabrir",
  "caja.movimientos.crear",
  "reportes.ver",
  "inventario.ver",
  "inventario.crear",
  "inventario.ajustar",
  "compras.ver",
  "compras.crear",
  "gastos.ver",
  "gastos.crear",
  "ventas.ver",
  "ventas.crear",
  "configuracion.ver",
  "configuracion.editar"
];

function money(value: number) {
  return new Prisma.Decimal(value);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function periodOffset(offset: number) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function ensureCashRegister() {
  const existingOpen = await prisma.cashRegister.findFirst({ where: { status: "OPEN" }, orderBy: { openedAt: "desc" } });
  if (existingOpen) return existingOpen;

  return prisma.cashRegister.create({
    data: {
      initialAmount: money(500),
      expectedAmount: money(500),
      notes: "Caja demo seed"
    }
  });
}

async function ensureCashMovement(input: { cashRegisterId: string; source: "PAYMENT" | "SALE" | "PURCHASE" | "EXPENSE" | "MANUAL"; referenceId: string; type: "INCOME" | "EXPENSE"; amount: Prisma.Decimal; description: string }) {
  const existing = await prisma.cashMovement.findFirst({ where: { source: input.source, referenceId: input.referenceId } });
  if (existing) return;

  await prisma.cashMovement.create({
    data: {
      cashRegisterId: input.cashRegisterId,
      source: input.source,
      referenceId: input.referenceId,
      type: input.type,
      amount: input.amount,
      description: input.description
    }
  });

  await prisma.cashRegister.update({
    where: { id: input.cashRegisterId },
    data: { expectedAmount: { increment: input.type === "INCOME" ? input.amount : input.amount.neg() } }
  });
}

async function recomputeFee(feeId: string) {
  const fee = await prisma.monthlyFee.findUnique({ where: { id: feeId }, include: { payments: { where: { status: "VALID" } } } });
  if (!fee) return;

  const paidAmount = fee.payments.reduce((sum, payment) => sum.add(payment.amount), money(0));
  const balance = fee.amount.sub(paidAmount);
  await prisma.monthlyFee.update({
    where: { id: fee.id },
    data: {
      paidAmount,
      balance,
      status: paidAmount.lte(0) ? "PENDING" : balance.lte(0) ? "PAID" : "PARTIAL"
    }
  });
}

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMINISTRADOR" },
    update: {},
    create: { name: "ADMINISTRADOR", description: "Acceso total al sistema" }
  });

  for (const code of permissions) {
    const permission = await prisma.permission.upsert({ where: { code }, update: {}, create: { code } });
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id }
    });
  }

  const adminUsername = process.env.ADMIN_EMAIL?.trim() || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || "change_me_admin";
  const existingAdmin =
    (await prisma.user.findUnique({ where: { username: adminUsername } })) ??
    (adminUsername !== "admin" ? await prisma.user.findUnique({ where: { username: "admin" } }) : null);

  const admin = existingAdmin
    ? await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          username: adminUsername,
          passwordHash: await bcrypt.hash(adminPassword, 12),
          isActive: true
        }
      })
    : await prisma.user.create({
        data: {
          username: adminUsername,
          passwordHash: await bcrypt.hash(adminPassword, 12),
          isActive: true
        }
      });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id }
  });


  for (const method of [
    { method: "CASH" as const, label: "Efectivo", description: "Pago en caja", requiresEvidence: false, sortOrder: 10 },
    { method: "YAPE" as const, label: "Yape", description: "Billetera Yape", requiresEvidence: true, sortOrder: 20 },
    { method: "PLIN" as const, label: "Plin", description: "Billetera Plin", requiresEvidence: true, sortOrder: 30 },
    { method: "TRANSFER" as const, label: "Transferencia", description: "Deposito o transferencia", requiresEvidence: true, sortOrder: 40 },
    { method: "CARD" as const, label: "Tarjeta", description: "POS o tarjeta", requiresEvidence: true, sortOrder: 50 },
    { method: "OTHER" as const, label: "Otro", description: "Otro metodo", requiresEvidence: true, sortOrder: 60 }
  ]) {
    await prisma.paymentMethodSetting.upsert({ where: { method: method.method }, update: method, create: method });
  }
  const plans = await Promise.all([
    prisma.servicePlan.upsert({ where: { type_name: { type: "INTERNET", name: "Internet Fibra 50 Mbps" } }, update: {}, create: { type: "INTERNET", name: "Internet Fibra 50 Mbps", description: "Plan residencial basico", monthlyPrice: money(69), downloadMbps: 50, uploadMbps: 20 } }),
    prisma.servicePlan.upsert({ where: { type_name: { type: "INTERNET", name: "Internet Fibra 100 Mbps" } }, update: {}, create: { type: "INTERNET", name: "Internet Fibra 100 Mbps", description: "Plan residencial recomendado", monthlyPrice: money(89), downloadMbps: 100, uploadMbps: 50 } }),
    prisma.servicePlan.upsert({ where: { type_name: { type: "TV", name: "IPTV 1 pantalla" } }, update: {}, create: { type: "TV", name: "IPTV 1 pantalla", description: "Acceso IPTV para una pantalla", monthlyPrice: money(25), maxScreens: 1 } }),
    prisma.servicePlan.upsert({ where: { type_name: { type: "TV", name: "IPTV 3 pantallas" } }, update: {}, create: { type: "TV", name: "IPTV 3 pantallas", description: "Acceso IPTV para familia", monthlyPrice: money(45), maxScreens: 3 } })
  ]);

  const materialInputs = [
    { sku: "ROUTER-FIBRA-001", name: "Router fibra doble banda", description: "Equipo para instalaciones residenciales", unit: "UND", costPrice: 85, salePrice: 120, stock: 12, minStock: 2 },
    { sku: "PATCHCORD-001", name: "Patch cord fibra optica", description: "Patch cord SC/APC para instalacion", unit: "UND", costPrice: 8, salePrice: 15, stock: 35, minStock: 5 },
    { sku: "CABLE-UTP-CAT6", name: "Cable UTP Cat6", description: "Cable por metro para cableado interno", unit: "M", costPrice: 1.4, salePrice: 2.5, stock: 240, minStock: 30 },
    { sku: "ONT-GPON-001", name: "ONT GPON residencial", description: "Terminal optico para fibra", unit: "UND", costPrice: 110, salePrice: 165, stock: 10, minStock: 2 },
    { sku: "CONECTOR-SCAPC", name: "Conector SC/APC", description: "Conector rapido para fibra", unit: "UND", costPrice: 2.2, salePrice: 5, stock: 80, minStock: 20 },
    { sku: "SPLITTER-1X8", name: "Splitter 1x8", description: "Splitter optico 1 a 8", unit: "UND", costPrice: 35, salePrice: 55, stock: 8, minStock: 2 }
  ];

  const materials = [];
  for (const material of materialInputs) {
    const created = await prisma.material.upsert({
      where: { name: material.name },
      update: {},
      create: { ...material, costPrice: money(material.costPrice), salePrice: money(material.salePrice) }
    });
    materials.push(created);

    const existingMovement = await prisma.materialMovement.findFirst({ where: { materialId: created.id, reason: "Stock inicial demo" } });
    if (!existingMovement) {
      await prisma.materialMovement.create({ data: { materialId: created.id, type: "PURCHASE", quantity: material.stock, unitCost: money(material.costPrice), reason: "Stock inicial demo" } });
    }
  }

  const suppliers = [];
  for (const supplier of [
    { name: "FibraNet Distribuciones SAC", documentNumber: "20600010001", contactName: "Luis Cardenas", phone: "987111222", email: "ventas@fibranet.pe", department: "Lima", province: "Lima", district: "Ate", address: "Av. Industrial 120", reference: "Frente al mercado" },
    { name: "TecnoRed Peru EIRL", documentNumber: "20600010002", contactName: "Mariela Torres", phone: "987333444", email: "contacto@tecnored.pe", department: "Lima", province: "Lima", district: "San Miguel", address: "Jr. Redes 455", reference: "Local 2" },
    { name: "CableMax Mayoristas", documentNumber: "20600010003", contactName: "Ruben Salas", phone: "987555666", email: "ventas@cablemax.pe", department: "Lima", province: "Lima", district: "Los Olivos", address: "Av. Universitaria 900", reference: "Galeria tecnica" },
    { name: "Importaciones Opticas Andinas", documentNumber: "20600010004", contactName: "Sofia Rojas", phone: "987777888", email: "sofia@opticasandinas.pe", department: "Callao", province: "Callao", district: "Bellavista", address: "Av. Colonial 320", reference: "Almacen principal" }
  ]) {
    suppliers.push(await prisma.supplier.upsert({ where: { name: supplier.name }, update: {}, create: { ...supplier, country: "PE", notes: "Proveedor demo" } }));
  }

  const categories = [];
  for (const category of [
    { name: "Alquiler de local", type: "RENT" as const, description: "Pago mensual de oficina o almacen" },
    { name: "Movilidad tecnica", type: "TRANSPORT" as const, description: "Traslados para instalaciones" },
    { name: "Planilla operativa", type: "PAYROLL" as const, description: "Pagos de personal" },
    { name: "Servicios publicos", type: "UTILITY" as const, description: "Luz, internet y otros servicios" }
  ]) {
    categories.push(await prisma.expenseCategory.upsert({ where: { name: category.name }, update: {}, create: category }));
  }

  const customers = [];
  for (const customer of [
    { documentNumber: "70000001", fullName: "Carlos Mendoza Quispe", phone: "955100001", email: "carlos.demo@novalink.pe", country: "PE", department: "Lima", province: "Lima", address: "Av. Los Pinos 120", district: "Ate", reference: "Casa azul", latitude: -12.0464, longitude: -76.9283, leadSource: "PANEL" },
    { documentNumber: "70000002", fullName: "Rosa Huaman Flores", phone: "955100002", email: "rosa.demo@novalink.pe", country: "PE", department: "Lima", province: "Lima", address: "Jr. Las Flores 450", district: "Santa Anita", reference: "Segundo piso", latitude: -12.0432, longitude: -76.9715, leadSource: "RECOMMENDATION" },
    { documentNumber: "70000003", fullName: "Miguel Torres Vega", phone: "955100003", email: "miguel.demo@novalink.pe", country: "PE", department: "Lima", province: "Lima", address: "Mz B Lt 8", district: "Villa El Salvador", reference: "Cerca al parque", latitude: -12.213, longitude: -76.9369, leadSource: "WHATSAPP" },
    { documentNumber: "70000004", fullName: "Patricia Salazar Rios", phone: "955100004", email: "patricia.demo@novalink.pe", country: "PE", department: "Lima", province: "Lima", address: "Calle Union 980", district: "San Juan de Lurigancho", reference: "Porton negro", latitude: -11.982, longitude: -77.008, leadSource: "WEB" }
  ]) {
    customers.push(await prisma.customer.upsert({ where: { documentNumber: customer.documentNumber }, update: customer, create: customer }));
  }

  const customerServices = [];
  const servicePlanPairs = [
    [customers[0], plans[1], plans[2]],
    [customers[1], plans[0], plans[3]],
    [customers[2], plans[1], plans[3]],
    [customers[3], plans[0], plans[2]]
  ] as const;

  for (const [customer, internetPlan, tvPlan] of servicePlanPairs) {
    for (const plan of [internetPlan, tvPlan]) {
      let service = await prisma.customerService.findFirst({ where: { customerId: customer.id, planId: plan.id } });
      if (!service) {
        service = await prisma.customerService.create({
          data: {
            customerId: customer.id,
            planId: plan.id,
            screenCount: plan.type === "TV" ? plan.maxScreens ?? 1 : null,
            installedAt: addDays(new Date(), -45),
            notes: "Servicio demo activo"
          }
        });
      } else if (service.status !== "ACTIVE") {
        service = await prisma.customerService.update({ where: { id: service.id }, data: { status: "ACTIVE" } });
      }
      await prisma.customerService.updateMany({
        where: {
          customerId: customer.id,
          status: "ACTIVE",
          id: { not: service.id },
          plan: { type: plan.type }
        },
        data: { status: "CANCELLED" }
      });
      customerServices.push(service);
    }
  }

  const cashRegister = await ensureCashRegister();
  const periods = [periodOffset(-2), periodOffset(-1), periodOffset(0), periodOffset(1)];
  const seededFees = [];

  for (const service of customerServices) {
    const plan = plans.find((item) => item.id === service.planId);
    if (!plan) continue;
    for (const period of periods) {
      const fee = await prisma.monthlyFee.upsert({
        where: { serviceId_period: { serviceId: service.id, period } },
        update: {},
        create: {
          serviceId: service.id,
          period,
          dueDate: new Date(`${period}-10T00:00:00.000Z`),
          amount: plan.monthlyPrice,
          balance: plan.monthlyPrice,
          notes: "Mensualidad demo"
        }
      });
      seededFees.push(fee);
    }
  }

  const paymentInputs = seededFees.slice(0, 8).map((fee, index) => ({
    fee,
    receiptCode: `T-DEMO-${String(index + 1).padStart(4, "0")}`,
    amount: index % 3 === 0 ? Number(fee.amount) : Math.max(10, Math.round(Number(fee.amount) / 2)),
    method: ["CASH", "YAPE", "PLIN", "TRANSFER"][index % 4] as "CASH" | "YAPE" | "PLIN" | "TRANSFER",
    notes: "Pago demo"
  }));

  for (const input of paymentInputs) {
    let payment = await prisma.payment.findUnique({ where: { receiptCode: input.receiptCode } });
    if (!payment) {
      payment = await prisma.payment.create({ data: { monthlyFeeId: input.fee.id, receiptCode: input.receiptCode, amount: money(input.amount), method: input.method, notes: input.notes } });
    }
    await ensureCashMovement({ cashRegisterId: cashRegister.id, source: "PAYMENT", referenceId: payment.id, type: "INCOME", amount: payment.amount, description: `Pago demo ${payment.receiptCode}` });
    await recomputeFee(input.fee.id);
  }

  const purchaseInputs = [
    { supplier: suppliers[0], receiptNumber: "COMP-DEMO-001", material: materials[0], quantity: 4, unitCost: 82 },
    { supplier: suppliers[1], receiptNumber: "COMP-DEMO-002", material: materials[3], quantity: 3, unitCost: 108 },
    { supplier: suppliers[2], receiptNumber: "COMP-DEMO-003", material: materials[2], quantity: 80, unitCost: 1.35 },
    { supplier: suppliers[3], receiptNumber: "COMP-DEMO-004", material: materials[5], quantity: 4, unitCost: 33 }
  ];

  for (const input of purchaseInputs) {
    let purchase = await prisma.materialPurchase.findFirst({ where: { receiptNumber: input.receiptNumber } });
    if (!purchase) {
      const subtotal = money(input.quantity * input.unitCost);
      purchase = await prisma.materialPurchase.create({
        data: {
          supplierId: input.supplier.id,
          supplierName: input.supplier.name,
          documentNumber: input.supplier.documentNumber,
          receiptNumber: input.receiptNumber,
          paymentMethod: "TRANSFER",
          paidFromCash: true,
          notes: "Compra demo",
          totalAmount: subtotal,
          items: { create: [{ materialId: input.material.id, description: input.material.name, quantity: input.quantity, quantityText: `${input.quantity} ${input.material.unit}`, unitCost: money(input.unitCost), subtotal }] }
        }
      });
      await prisma.material.update({ where: { id: input.material.id }, data: { stock: { increment: input.quantity } } });
      await prisma.materialMovement.create({ data: { materialId: input.material.id, type: "PURCHASE", quantity: input.quantity, unitCost: money(input.unitCost), reason: "Compra demo", reference: input.receiptNumber } });
    }
    await ensureCashMovement({ cashRegisterId: cashRegister.id, source: "PURCHASE", referenceId: purchase.id, type: "EXPENSE", amount: purchase.totalAmount, description: `Compra demo ${input.receiptNumber}` });
  }

  for (const input of [
    { reference: "GASTO-DEMO-001", category: categories[0], description: "Alquiler oficina julio", amount: 650 },
    { reference: "GASTO-DEMO-002", category: categories[1], description: "Movilidad cuadrilla norte", amount: 120 },
    { reference: "GASTO-DEMO-003", category: categories[2], description: "Adelanto tecnico instalador", amount: 400 },
    { reference: "GASTO-DEMO-004", category: categories[3], description: "Recibo de luz almacen", amount: 180 }
  ]) {
    let expense = await prisma.expense.findFirst({ where: { reference: input.reference } });
    if (!expense) {
      expense = await prisma.expense.create({ data: { categoryId: input.category.id, description: input.description, amount: money(input.amount), paymentMethod: "CASH", paidFromCash: true, reference: input.reference, notes: "Gasto demo" } });
    }
    await ensureCashMovement({ cashRegisterId: cashRegister.id, source: "EXPENSE", referenceId: expense.id, type: "EXPENSE", amount: expense.amount, description: input.description });
  }

  const saleInputs = [
    { note: "VENTA-DEMO-001", customerName: customers[0].fullName, documentNumber: customers[0].documentNumber, material: materials[1], quantity: 2, unitPrice: 15, method: "CASH" as const },
    { note: "VENTA-DEMO-002", customerName: customers[1].fullName, documentNumber: customers[1].documentNumber, material: materials[4], quantity: 6, unitPrice: 5, method: "YAPE" as const },
    { note: "VENTA-DEMO-003", customerName: customers[2].fullName, documentNumber: customers[2].documentNumber, material: materials[0], quantity: 1, unitPrice: 120, method: "CARD" as const },
    { note: "VENTA-DEMO-004", customerName: customers[3].fullName, documentNumber: customers[3].documentNumber, material: materials[2], quantity: 20, unitPrice: 2.5, method: "PLIN" as const }
  ];

  for (const input of saleInputs) {
    let sale = await prisma.materialSale.findFirst({ where: { notes: input.note } });
    if (!sale) {
      const subtotal = money(input.quantity * input.unitPrice);
      sale = await prisma.materialSale.create({
        data: {
          customerName: input.customerName,
          documentNumber: input.documentNumber,
          paymentMethod: input.method,
          discountAmount: money(0),
          totalAmount: subtotal,
          notes: input.note,
          items: { create: [{ materialId: input.material.id, quantity: input.quantity, unitPrice: money(input.unitPrice), subtotal }] }
        }
      });
      await prisma.material.update({ where: { id: input.material.id }, data: { stock: { decrement: input.quantity } } });
      await prisma.materialMovement.create({ data: { materialId: input.material.id, type: "SALE", quantity: input.quantity, unitPrice: money(input.unitPrice), reason: "Venta demo", reference: input.note } });
    }
    await ensureCashMovement({ cashRegisterId: cashRegister.id, source: "SALE", referenceId: sale.id, type: "INCOME", amount: sale.totalAmount, description: `Venta demo ${input.note}` });
  }

  console.log("Seed demo completo: 4+ registros por flujo principal.");
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });




