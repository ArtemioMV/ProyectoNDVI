import { ApiProperty } from "@nestjs/swagger";
import { CustomerServiceStatus, CustomerStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class ChangeCustomerStatusDto {
  @ApiProperty({ enum: CustomerStatus, example: CustomerStatus.SUSPENDED })
  @IsEnum(CustomerStatus)
  status!: CustomerStatus;
}

export class ChangeServiceStatusDto {
  @ApiProperty({ enum: CustomerServiceStatus, example: CustomerServiceStatus.SUSPENDED })
  @IsEnum(CustomerServiceStatus)
  status!: CustomerServiceStatus;
}
