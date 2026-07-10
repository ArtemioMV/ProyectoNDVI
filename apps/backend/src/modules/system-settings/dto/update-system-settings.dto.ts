import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateSystemSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  loginHeadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  loginSubline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  loginFooter?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ruc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  sessionDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mailHost?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mailPort?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mailUser?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mailPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mailFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mailSecure?: boolean;
}
