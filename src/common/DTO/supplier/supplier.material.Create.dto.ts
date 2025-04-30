import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SupplierMaterialCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  supplierId: string;
}
