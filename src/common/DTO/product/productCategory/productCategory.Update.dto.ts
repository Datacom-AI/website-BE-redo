import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ProductCategoryUpdateDTO {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
