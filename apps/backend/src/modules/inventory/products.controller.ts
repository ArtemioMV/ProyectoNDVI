import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { CreateMaterialMovementDto } from "./dto/create-material-movement.dto";
import { UpdateMaterialDto } from "./dto/update-material.dto";
import { InventoryService } from "./inventory.service";

@ApiTags("productos")
@Controller("productos")
export class ProductsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: "Listar productos de inventario" })
  @ApiQuery({ name: "search", required: false })
  findAll(@Query("search") search?: string) {
    return this.inventoryService.findMaterials(search);
  }

  @Post()
  @ApiOperation({ summary: "Crear producto de inventario" })
  create(@Body() dto: CreateMaterialDto) {
    return this.inventoryService.createMaterial(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar producto (precios, datos, activar/desactivar)" })
  update(@Param("id") id: string, @Body() dto: UpdateMaterialDto) {
    return this.inventoryService.updateMaterial(id, dto);
  }

  @Post(":id/movimientos")
  @ApiOperation({ summary: "Registrar compra o ajuste de inventario" })
  createMovement(@Param("id") id: string, @Body() dto: CreateMaterialMovementDto) {
    return this.inventoryService.createMovement(id, dto);
  }
}
