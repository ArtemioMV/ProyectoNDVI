import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested } from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class CreateMaterialSaleItemDto {
  @ApiProperty()
  @IsUUID()
  materialId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity!: number;
}

export class CreateMaterialSaleDto {
  @ApiPropertyOptional({ example: "Juan Perez" })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  customerName?: string;

  @ApiPropertyOptional({ example: "12345678" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  documentNumber?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ example: "Venta mostrador" })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  notes?: string;

  @ApiProperty({ type: [CreateMaterialSaleItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialSaleItemDto)
  items!: CreateMaterialSaleItemDto[];
}
