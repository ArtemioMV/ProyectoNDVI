import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Permissions } from "../../common/auth/permissions.decorator";
import type { AuthenticatedUser } from "../../common/auth/types";
import { GenerateMonthlyFeesDto } from "./dto/generate-monthly-fees.dto";
import { RegisterPaymentDto } from "./dto/register-payment.dto";
import { VoidPaymentDto } from "./dto/void-payment.dto";
import { PaymentsService } from "./payments.service";

@ApiBearerAuth()
@ApiTags("pagos")
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get("clientes/:customerId/historial-pagos")
  @Permissions("pagos.ver")
  @ApiOperation({ summary: "Ver historial financiero y pagos de un cliente" })
  getCustomerPaymentHistory(@Param("customerId") customerId: string) {
    return this.paymentsService.getCustomerPaymentHistory(customerId);
  }

  @Post("clientes/:customerId/mensualidades/generar")
  @Permissions("mensualidades.generar")
  @ApiOperation({ summary: "Generar mensualidades de un cliente para un periodo" })
  generateMonthlyFees(@Param("customerId") customerId: string, @Body() dto: GenerateMonthlyFeesDto) {
    return this.paymentsService.generateMonthlyFees(customerId, dto);
  }

  @Post("mensualidades/generar-automaticas")
  @Permissions("mensualidades.generar")
  @ApiOperation({ summary: "Generar mensualidades automaticas segun fecha de instalacion" })
  generateAutomaticMonthlyFees() {
    return this.paymentsService.generateAutomaticMonthlyFees();
  }

  @Get("clientes/:customerId/contrato")
  @Permissions("contratos.generar")
  @ApiOperation({ summary: "Generar contrato simple del cliente" })
  getCustomerContract(@Param("customerId") customerId: string) {
    return this.paymentsService.getCustomerContract(customerId);
  }

  @Post("pagos")
  @Permissions("pagos.registrar")
  @ApiOperation({ summary: "Registrar pago total o parcial de mensualidad" })
  registerPayment(@Body() dto: RegisterPaymentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.registerPayment(dto, user);
  }

  @Patch("pagos/:paymentId/anular")
  @Permissions("pagos.anular")
  @ApiOperation({ summary: "Anular pago y revertir saldo/caja" })
  voidPayment(@Param("paymentId") paymentId: string, @Body() dto: VoidPaymentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.voidPayment(paymentId, dto, user);
  }

  @Get("pagos/:paymentId/ticket")
  @Permissions("pagos.imprimir")
  @ApiOperation({ summary: "Generar ticket de pago" })
  getPaymentTicket(@Param("paymentId") paymentId: string) {
    return this.paymentsService.getPaymentTicket(paymentId);
  }
}
