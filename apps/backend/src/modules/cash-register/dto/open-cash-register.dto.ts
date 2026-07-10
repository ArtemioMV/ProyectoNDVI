import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class OpenCashRegisterDto {
  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  initialAmount!: number;

  @ApiPropertyOptional({ example: "Apertura turno manana" })
  @IsOptional()
  @IsString()
  notes?: string;
}
