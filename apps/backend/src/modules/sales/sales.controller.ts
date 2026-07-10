import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { InventoryService } from "../inventory/inventory.service";
import { CreateMaterialSaleDto } from "./dto/create-material-sale.dto";

@ApiTags("ventas")
@Controller("ventas")
export class SalesController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: "Listar ultimas ventas de materiales" })
  findAll() {
    return this.inventoryService.findSales();
  }

  @Post()
  @ApiOperation({ summary: "Registrar venta de materiales" })
  create(@Body() dto: CreateMaterialSaleDto) {
    return this.inventoryService.createSale(dto);
  }

  @Patch(":id/anular")
  @ApiOperation({ summary: "Anular venta: repone stock y reversa el ingreso en caja" })
  void(@Param("id") id: string) {
    return this.inventoryService.voidSale(id);
  }
}
