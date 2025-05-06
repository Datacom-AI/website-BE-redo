import { IsNotEmpty, IsString } from 'class-validator';

export class RetailerProductCategoryCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;
}
