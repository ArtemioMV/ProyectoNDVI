import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../common/auth/permissions.decorator";
import { ReportsService } from "./reports.service";

@ApiBearerAuth()
@ApiTags("reportes")
@Controller("reportes")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("resumen")
  @Permissions("reportes.ver")
  @ApiOperation({ summary: "Resumen financiero y operativo por rango de fechas" })
  @ApiQuery({ name: "from", required: false, example: "2026-07-01" })
  @ApiQuery({ name: "to", required: false, example: "2026-07-31" })
  getSummary(@Query("from") from?: string, @Query("to") to?: string) {
    return this.reportsService.getSummary(from, to);
  }

  @Get("inventario")
  @Permissions("reportes.ver")
  @ApiOperation({ summary: "Inventario valorizado y productos con stock bajo" })
  getInventory() {
    return this.reportsService.getInventoryReport();
  }

  @Get("caja")
  @Permissions("reportes.ver")
  @ApiOperation({ summary: "Ultimos cierres de caja con diferencias" })
  getCashClosures() {
    return this.reportsService.getCashClosures();
  }

  @Get("mensual")
  @Permissions("reportes.ver")
  @ApiOperation({ summary: "Serie mensual de ingresos vs salidas (ultimos 6 meses)" })
  getMonthlySeries() {
    return this.reportsService.getMonthlySeries();
  }
}
