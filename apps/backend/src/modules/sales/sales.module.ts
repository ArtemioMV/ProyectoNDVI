import { Module } from "@nestjs/common";
import { InventoryModule } from "../inventory/inventory.module";
import { SalesController } from "./sales.controller";

@Module({
  imports: [InventoryModule],
  controllers: [SalesController]
})
export class SalesModule {}
