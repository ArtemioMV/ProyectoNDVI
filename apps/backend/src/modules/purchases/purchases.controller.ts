import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateMaterialPurchaseDto } from "./dto/create-material-purchase.dto";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { PurchasesService } from "./purchases.service";

@ApiTags("compras")
@Controller("compras")
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @ApiOperation({ summary: "Listar ultimas compras" })
  findPurchases() {
    return this.purchasesService.findPurchases();
  }

  @Post()
  @ApiOperation({ summary: "Registrar compra de materiales" })
  createPurchase(@Body() dto: CreateMaterialPurchaseDto) {
    return this.purchasesService.createPurchase(dto);
  }

  @Get("proveedores")
  @ApiOperation({ summary: "Listar proveedores" })
  findSuppliers() {
    return this.purchasesService.findSuppliers();
  }

  @Post("proveedores")
  @ApiOperation({ summary: "Crear proveedor" })
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.purchasesService.createSupplier(dto);
  }

  @Patch("proveedores/:id")
  @ApiOperation({ summary: "Actualizar proveedor (datos, activar/desactivar)" })
  updateSupplier(@Param("id") id: string, @Body() dto: UpdateSupplierDto) {
    return this.purchasesService.updateSupplier(id, dto);
  }

  @Patch(":id/anular")
  @ApiOperation({ summary: "Anular compra: retira stock y devuelve efectivo a caja si aplica" })
  void(@Param("id") id: string) {
    return this.purchasesService.voidPurchase(id);
  }
}
