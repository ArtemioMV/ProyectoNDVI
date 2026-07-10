import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../common/auth/permissions.decorator";
import { Public } from "../../common/auth/public.decorator";
import { UpdateSystemSettingsDto } from "./dto/update-system-settings.dto";
import { SystemSettingsService } from "./system-settings.service";

@ApiTags("configuracion")
@Controller("configuracion")
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Public()
  @Get("publica")
  getPublic() {
    return this.systemSettingsService.getPublic();
  }

  @ApiBearerAuth()
  @Get()
  @Permissions("configuracion.ver")
  getPrivate() {
    return this.systemSettingsService.getPrivate();
  }

  @ApiBearerAuth()
  @Put()
  @Permissions("configuracion.editar")
  update(@Body() dto: UpdateSystemSettingsDto) {
    return this.systemSettingsService.update(dto);
  }
}
