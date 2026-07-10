import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentMethod } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ArrayMaxSize, Min, ValidateNested } from "class-validator";

export class PaymentEvidenceDto {
  @ApiProperty({ example: "yape-001.jpg" })
  @IsString()
  fileName!: string;

  @ApiProperty({ example: "uploads/payments/yape-001.jpg" })
  @IsString()
  url!: string;

  @ApiPropertyOptional({ example: "image/jpeg" })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ example: 120000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeBytes?: number;
}

export class RegisterPaymentDto {
  @ApiProperty()
  @IsUUID()
  monthlyFeeId!: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({ type: [PaymentEvidenceDto], maxItems: 3 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => PaymentEvidenceDto)
  evidences?: PaymentEvidenceDto[];

  @ApiPropertyOptional({ example: "Pago parcial" })
  @IsOptional()
  @IsString()
  notes?: string;
}
