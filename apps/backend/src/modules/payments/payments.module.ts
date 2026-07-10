import { Module } from "@nestjs/common";
import { BillingSchedulerService } from "./billing-scheduler.service";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, BillingSchedulerService]
})
export class PaymentsModule {}
