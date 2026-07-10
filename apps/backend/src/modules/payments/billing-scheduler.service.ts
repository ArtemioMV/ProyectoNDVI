import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

const BOOT_DELAY_MS = 15_000;
const RUN_INTERVAL_MS = 6 * 60 * 60 * 1000;

/**
 * Motor de facturacion automatica (docs/business-rules/monthly-billing.md):
 * genera las mensualidades del ciclo vigente para servicios ACTIVE, ancladas a
 * la fecha de activacion. Corre al arrancar y luego cada 6 horas; el upsert
 * por servicio+periodo hace la corrida idempotente.
 */
@Injectable()
export class BillingSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BillingSchedulerService.name);
  private bootTimeout?: NodeJS.Timeout;
  private interval?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly paymentsService: PaymentsService) {}

  onModuleInit() {
    this.bootTimeout = setTimeout(() => void this.run(), BOOT_DELAY_MS);
    this.interval = setInterval(() => void this.run(), RUN_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.bootTimeout) clearTimeout(this.bootTimeout);
    if (this.interval) clearInterval(this.interval);
  }

  private async run() {
    if (this.running) return;
    this.running = true;
    try {
      const result = await this.paymentsService.generateAutomaticMonthlyFees();
      const count = Array.isArray(result.data) ? result.data.length : 0;
      this.logger.log(`Facturacion automatica al dia (${count} ciclo(s) vigente(s))`);
    } catch (error) {
      this.logger.error("Fallo la generacion automatica de mensualidades", error instanceof Error ? error.stack : String(error));
    } finally {
      this.running = false;
    }
  }
}
