import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../common/auth/public.decorator";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      success: true,
      data: {
        status: "ok",
        service: "backend"
      }
    };
  }
}
