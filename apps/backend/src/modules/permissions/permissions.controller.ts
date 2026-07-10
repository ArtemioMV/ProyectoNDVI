import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../common/auth/permissions.decorator";
import { PermissionsService } from "./permissions.service";

@ApiBearerAuth()
@ApiTags("permisos")
@Controller("permisos")
@Permissions("roles.ver")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }
}
