import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../common/auth/permissions.decorator";
import { CreatePartnerDto, UpdatePartnerDto } from "./dto/save-partner.dto";
import { PartnersService } from "./partners.service";

@ApiBearerAuth()
@ApiTags("socios")
@Controller("socios")
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @Permissions("configuracion.ver")
  @ApiOperation({ summary: "Listar socios y su participacion" })
  findAll() {
    return this.partnersService.findAll();
  }

  @Post()
  @Permissions("configuracion.editar")
  @ApiOperation({ summary: "Registrar socio" })
  create(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  @Patch(":id")
  @Permissions("configuracion.editar")
  @ApiOperation({ summary: "Actualizar socio (nombre, %, activo)" })
  update(@Param("id") id: string, @Body() dto: UpdatePartnerDto) {
    return this.partnersService.update(id, dto);
  }
}
