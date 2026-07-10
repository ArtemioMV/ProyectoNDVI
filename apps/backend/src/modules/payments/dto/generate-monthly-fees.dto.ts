import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsISO8601, IsOptional, IsString, Matches } from "class-validator";

export class GenerateMonthlyFeesDto {
  @ApiProperty({ example: "2026-07" })
  @Matches(/^\d{4}-\d{2}$/)
  period!: string;

  @ApiPropertyOptional({ example: "2026-07-31T00:00:00.000Z" })
  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @ApiPropertyOptional({ example: "Generacion manual de julio" })
  @IsOptional()
  @IsString()
  notes?: string;
}
