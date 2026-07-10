import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CloseCashRegisterDto {
  @ApiPropertyOptional({ example: 350 })
  @IsNumber()
  @Min(0)
  countedAmount!: number;

  @ApiPropertyOptional({ example: "Cierre sin diferencias" })
  @IsOptional()
  @IsString()
  notes?: string;
}
