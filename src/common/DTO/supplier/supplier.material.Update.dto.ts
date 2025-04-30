import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SupplierMaterialUpdateDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
