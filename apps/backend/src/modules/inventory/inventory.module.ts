import { Module } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { ProductsController } from "./products.controller";

@Module({
  controllers: [ProductsController],
  providers: [InventoryService],
  exports: [InventoryService]
})
export class InventoryModule {}
