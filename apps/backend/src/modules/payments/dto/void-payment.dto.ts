import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class VoidPaymentDto {
  @ApiPropertyOptional({ example: "Pago registrado por error" })
  @IsOptional()
  @IsString()
  reason?: string;
}
