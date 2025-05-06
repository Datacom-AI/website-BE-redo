import { IsOptional, IsString } from 'class-validator';

export class ProductCategoryUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;
}
