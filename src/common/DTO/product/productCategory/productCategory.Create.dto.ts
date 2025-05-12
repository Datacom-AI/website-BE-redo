import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ProductCategoryCreateDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;
}
