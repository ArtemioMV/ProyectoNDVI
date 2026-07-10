import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CollectionsService } from "./collections.service";

@ApiTags("cobranza")
@Controller("cobranza")
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: "Vista global de cobranza y mensualidades" })
  findAll(
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("period") period?: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string
  ) {
    return this.collectionsService.findAll({ search, status, period, dateFrom, dateTo });
  }
}

