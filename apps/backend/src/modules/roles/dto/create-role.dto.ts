import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayUnique, IsArray, IsOptional, IsString, MinLength } from "class-validator";

export class CreateRoleDto {
  @ApiProperty({ example: "SECRETARIA_CAJA" })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], example: ["pagos.ver", "pagos.registrar"] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions?: string[];
}
