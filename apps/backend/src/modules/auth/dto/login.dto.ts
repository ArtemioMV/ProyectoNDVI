import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@marvasolutions.lat" })
  @IsString()
  username!: string;

  @ApiProperty({ example: "admin123" })
  @IsString()
  @MinLength(8)
  password!: string;
}
