import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentMethod } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

export class CreateExpenseDto {
  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: "PAGO ENERGIA CABECERA" })
  @IsString()
  @MaxLength(180)
  description!: string;

  @ApiProperty({ example: 517.5 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  paidFromCash?: boolean;

  @ApiPropertyOptional({ example: "Recibo energia junio" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(240)
  notes?: string;

  @ApiPropertyOptional({ example: "2026-06-15T00:00:00.000Z" })
  @IsOptional()
  @IsString()
  expenseDate?: string;
}
