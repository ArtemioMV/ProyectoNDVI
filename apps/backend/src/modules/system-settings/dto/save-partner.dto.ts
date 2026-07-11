import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreatePartnerDto {
  @ApiProperty({ example: "NORIS" })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 33.33, description: "Porcentaje de participacion en la ganancia neta" })
  @IsNumber()
  @Min(0)
  @Max(100)
  sharePercent!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {}
