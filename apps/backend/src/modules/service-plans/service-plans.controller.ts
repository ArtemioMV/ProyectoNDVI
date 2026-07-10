import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PlanType } from "@prisma/client";
import { CreateServicePlanDto } from "./dto/create-service-plan.dto";
import { UpdateServicePlanDto } from "./dto/update-service-plan.dto";
import { ServicePlansService } from "./service-plans.service";

@ApiTags("planes")
@Controller("planes")
export class ServicePlansController {
  constructor(private readonly servicePlansService: ServicePlansService) {}

  @Get()
  @ApiOperation({ summary: "Listar planes de internet y TV" })
  @ApiQuery({ name: "type", required: false, enum: PlanType })
  findAll(@Query("type") type?: PlanType) {
    return this.servicePlansService.findAll(type);
  }

  @Post()
  @ApiOperation({ summary: "Crear plan de internet o TV" })
  create(@Body() dto: CreateServicePlanDto) {
    return this.servicePlansService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar o (des)activar un plan" })
  update(@Param("id") id: string, @Body() dto: UpdateServicePlanDto) {
    return this.servicePlansService.update(id, dto);
  }
}

