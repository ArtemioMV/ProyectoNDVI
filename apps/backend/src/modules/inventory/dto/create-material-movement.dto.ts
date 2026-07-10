import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InventoryMovementType } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateMaterialMovementDto {
  @ApiProperty({ enum: InventoryMovementType, example: InventoryMovementType.INSTALLATION })
  @IsEnum(InventoryMovementType)
  type!: InventoryMovementType;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity!: number;


  @ApiPropertyOptional({ example: "Ajuste de stock" })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  reason?: string;

  @ApiPropertyOptional({ example: "OT-001" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  reference?: string;
}
