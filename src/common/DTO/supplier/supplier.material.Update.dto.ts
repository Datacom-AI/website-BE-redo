import { IsOptional, IsString } from 'class-validator';

export class SupplierMaterialUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;
}
