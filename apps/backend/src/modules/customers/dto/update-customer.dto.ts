import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateCustomerDto } from "./create-customer.dto";

// Solo datos de identidad y ubicacion: los servicios se gestionan en su propio modulo.
export class UpdateCustomerDto extends PartialType(OmitType(CreateCustomerDto, ["services"] as const)) {}
