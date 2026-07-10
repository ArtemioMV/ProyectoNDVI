import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateMaterialDto {
  @ApiPropertyOptional({ example: "ROUTER-001" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @ApiProperty({ example: "Router fibra doble banda" })
  @IsString()
  @MaxLength(140)
  name!: string;

  @ApiPropertyOptional({ example: "Router para instalaciones residenciales" })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @ApiProperty({ example: "UND" })
  @IsString()
  @MaxLength(20)
  unit!: string;


  @ApiProperty({ example: 120 })
  @IsNumber()
  @Min(0)
  salePrice!: number;

  @ApiPropertyOptional({ example: 130 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coveragePrice?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  installPrice?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isInstallationMaterial?: boolean;

  @ApiPropertyOptional({ example: "https://.../foto.webp" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;


  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  minStock?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
