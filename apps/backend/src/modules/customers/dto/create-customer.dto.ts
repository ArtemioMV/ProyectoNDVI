import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested
} from "class-validator";

export class CreateCustomerServiceDto {
  @ApiProperty()
  @IsUUID()
  planId!: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  screenCount?: number;

  @ApiPropertyOptional({ example: "Instalar router en sala" })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  notes?: string;
}

export class CreateCustomerDto {
  @ApiPropertyOptional({ example: "DNI" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  documentType?: string;

  @ApiProperty({ example: "12345678" })
  @IsString()
  @MaxLength(20)
  documentNumber!: string;

  @ApiProperty({ example: "Juan Perez" })
  @IsString()
  @MaxLength(160)
  fullName!: string;

  @ApiPropertyOptional({ example: "1990-05-12" })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: "2026-07-08" })
  @IsOptional()
  @IsDateString()
  signupDate?: string;

  @ApiPropertyOptional({ example: "999888777" })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: "cliente@correo.com" })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({ example: "PE" })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional({ example: "La Libertad" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ example: "Viru" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({ example: "Av. Principal 123" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  address?: string;

  @ApiPropertyOptional({ example: "Chao" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ example: "Frente al parque" })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  reference?: string;

  @ApiPropertyOptional({ example: -12.0464 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -77.0428 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: "Cliente referido por vecino" })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  identityNotes?: string;

  @ApiPropertyOptional({ example: "https://cdn.empresa.com/clientes/12345678.jpg" })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  photoUrl?: string;

  @ApiPropertyOptional({ example: "WHATSAPP" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  leadSource?: string;

  @ApiProperty({ type: [CreateCustomerServiceDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerServiceDto)
  services!: CreateCustomerServiceDto[];
}

