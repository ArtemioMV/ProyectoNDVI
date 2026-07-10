import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Permissions } from "../../common/auth/permissions.decorator";
import type { AuthenticatedUser } from "../../common/auth/types";
import { CashRegisterService } from "./cash-register.service";
import { CloseCashRegisterDto } from "./dto/close-cash-register.dto";
import { CreateManualCashMovementDto } from "./dto/create-manual-cash-movement.dto";
import { OpenCashRegisterDto } from "./dto/open-cash-register.dto";

@ApiBearerAuth()
@ApiTags("caja")
@Controller("caja")
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Get("actual")
  @Permissions("caja.ver")
  @ApiOperation({ summary: "Consultar caja abierta actual" })
  getCurrent() {
    return this.cashRegisterService.getCurrent();
  }

  @Get("historial")
  @Permissions("caja.ver")
  @ApiOperation({ summary: "Listar historial de cajas" })
  findAll() {
    return this.cashRegisterService.findAll();
  }

  @Post("abrir")
  @Permissions("caja.abrir")
  @ApiOperation({ summary: "Abrir caja" })
  open(@Body() dto: OpenCashRegisterDto) {
    return this.cashRegisterService.open(dto);
  }

  @Post(":id/cerrar")
  @Permissions("caja.cerrar")
  @ApiOperation({ summary: "Cerrar caja" })
  close(@Param("id") id: string, @Body() dto: CloseCashRegisterDto) {
    return this.cashRegisterService.close(id, dto);
  }

  @Post(":id/reabrir")
  @Permissions("caja.reabrir")
  @ApiOperation({ summary: "Reabrir una caja cerrada (correcciones)" })
  reopen(@Param("id") id: string) {
    return this.cashRegisterService.reopen(id);
  }

  @Post(":id/movimientos")
  @Permissions("caja.movimientos.crear")
  @ApiOperation({ summary: "Registrar ingreso o egreso manual" })
  createManualMovement(@Param("id") id: string, @Body() dto: CreateManualCashMovementDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cashRegisterService.createManualMovement(id, dto, user);
  }
}
