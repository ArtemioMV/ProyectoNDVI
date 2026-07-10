import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ChangeCustomerStatusDto, ChangeServiceStatusDto } from "./dto/change-status.dto";
import { CreateCustomerDto, CreateCustomerServiceDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CustomersService } from "./customers.service";

@ApiTags("customers")
@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: "Listar clientes con sus servicios" })
  @ApiQuery({ name: "search", required: false })
  findAll(@Query("search") search?: string) {
    return this.customersService.findAll(search);
  }

  @Post()
  @ApiOperation({ summary: "Crear cliente con planes contratados" })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar datos de identidad y ubicacion del cliente" })
  update(@Param("id") id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Post(":id/servicios")
  @ApiOperation({ summary: "Agregar un servicio (plan) a un cliente existente" })
  addService(@Param("id") id: string, @Body() dto: CreateCustomerServiceDto) {
    return this.customersService.addService(id, dto);
  }

  @Patch(":id/estado")
  @ApiOperation({ summary: "Suspender, cancelar o reactivar al cliente (cascada a sus servicios)" })
  changeStatus(@Param("id") id: string, @Body() dto: ChangeCustomerStatusDto) {
    return this.customersService.changeStatus(id, dto.status);
  }

  @Patch(":id/servicios/:serviceId/estado")
  @ApiOperation({ summary: "Suspender, cancelar o reactivar un servicio del cliente" })
  changeServiceStatus(
    @Param("id") id: string,
    @Param("serviceId") serviceId: string,
    @Body() dto: ChangeServiceStatusDto
  ) {
    return this.customersService.changeServiceStatus(id, serviceId, dto.status);
  }
}
