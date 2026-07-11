import { Module } from "@nestjs/common";
import { PartnersController } from "./partners.controller";
import { PartnersService } from "./partners.service";
import { SystemSettingsController } from "./system-settings.controller";
import { SystemSettingsService } from "./system-settings.service";

@Module({
  controllers: [SystemSettingsController, PartnersController],
  providers: [SystemSettingsService, PartnersService],
  exports: [SystemSettingsService]
})
export class SystemSettingsModule {}
