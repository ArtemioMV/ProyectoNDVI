import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../common/auth/permissions.decorator";
import { UpsertPaymentMethodDto } from "./dto/upsert-payment-method.dto";
import { PaymentMethodsService } from "./payment-methods.service";

@ApiBearerAuth()
@ApiTags("metodos-pago")
@Controller("metodos-pago")
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @Permissions("metodos-pago.ver")
  findAll() {
    return this.paymentMethodsService.findAll();
  }

  @Post()
  @Permissions("metodos-pago.editar")
  upsert(@Body() dto: UpsertPaymentMethodDto) {
    return this.paymentMethodsService.upsert(dto);
  }

  @Patch(":id")
  @Permissions("metodos-pago.editar")
  update(@Param("id") id: string, @Body() dto: UpsertPaymentMethodDto) {
    return this.paymentMethodsService.update(id, dto);
  }
}
