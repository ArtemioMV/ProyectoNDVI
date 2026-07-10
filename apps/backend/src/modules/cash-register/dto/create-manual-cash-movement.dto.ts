import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CashMovementType } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateManualCashMovementDto {
  @ApiProperty({ enum: CashMovementType, example: CashMovementType.EXPENSE })
  @IsEnum(CashMovementType)
  type!: CashMovementType;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: "Compra de utiles" })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: "Boleta 001" })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
