import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested } from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class CreateMaterialPurchaseItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  materialId?: string;

  @ApiProperty({ example: "COMPRA DE ONUS CADA UNO A 125" })
  @IsString()
  @MaxLength(180)
  description!: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity!: number;

  @ApiPropertyOptional({ example: "15 UND" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  quantityText?: string;

  @ApiProperty({ example: 125 })
  @IsNumber()
  @Min(0)
  unitCost!: number;
}

export class CreateMaterialPurchaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: "Proveedor local" })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  supplierName?: string;

  @ApiPropertyOptional({ example: "RUC/DNI" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  documentNumber?: string;

  @ApiPropertyOptional({ example: "B001-123" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  receiptNumber?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  paidFromCash?: boolean;

  @ApiPropertyOptional({ example: "Compra junio" })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  notes?: string;

  @ApiPropertyOptional({ example: "2026-06-15T00:00:00.000Z" })
  @IsOptional()
  @IsString()
  purchasedAt?: string;

  @ApiProperty({ type: [CreateMaterialPurchaseItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialPurchaseItemDto)
  items!: CreateMaterialPurchaseItemDto[];
}
