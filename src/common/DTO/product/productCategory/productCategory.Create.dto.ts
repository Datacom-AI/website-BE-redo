import { IsNotEmpty, IsString } from 'class-validator';

export class ProductCategoryCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;
}
