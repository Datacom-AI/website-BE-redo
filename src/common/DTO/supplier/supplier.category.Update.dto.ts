import { IsOptional, IsString } from 'class-validator';

export class SupplierCategoryUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;
}
