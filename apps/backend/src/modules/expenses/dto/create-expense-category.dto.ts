import { ApiPropertyOptional } from "@nestjs/swagger";
import { ExpenseCategoryType } from "@prisma/client";
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateExpenseCategoryDto {
  @ApiPropertyOptional({ example: "Energia electrica" })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ enum: ExpenseCategoryType, example: ExpenseCategoryType.UTILITY })
  @IsOptional()
  @IsEnum(ExpenseCategoryType)
  type?: ExpenseCategoryType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
