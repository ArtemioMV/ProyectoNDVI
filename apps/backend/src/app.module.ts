import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnvironment } from "./config/env.validation";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AuditModule } from "./modules/audit/audit.module";
import { CashRegisterModule } from "./modules/cash-register/cash-register.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { CollectionsModule } from "./modules/collections/collections.module";
import { ExpensesModule } from "./modules/expenses/expenses.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PaymentMethodsModule } from "./modules/payment-methods/payment-methods.module";
import { PurchasesModule } from "./modules/purchases/purchases.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { RolesModule } from "./modules/roles/roles.module";
import { SalesModule } from "./modules/sales/sales.module";
import { ServicePlansModule } from "./modules/service-plans/service-plans.module";
import { SystemSettingsModule } from "./modules/system-settings/system-settings.module";
import { UsersModule } from "./modules/users/users.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ServicePlansModule,
    SystemSettingsModule,
    CustomersModule,
    CollectionsModule,
    ExpensesModule,
    CashRegisterModule,
    InventoryModule,
    PaymentsModule,
    PaymentMethodsModule,
    PurchasesModule,
    ReportsModule,
    SalesModule,
    RolesModule,
    PermissionsModule,
    AuditModule
  ]
})
export class AppModule {}







