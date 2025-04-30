import { IsNotEmpty, IsString } from 'class-validator';

export class SupplierCategoryCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;
}
