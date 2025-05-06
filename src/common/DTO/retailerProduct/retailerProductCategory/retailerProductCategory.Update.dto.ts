import { IsOptional, IsString } from 'class-validator';

export class RetailerProductCategoryUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;
}
