import { IsNotEmpty } from 'class-validator';

export class BrandProfileUpdateDTO {
  @IsNotEmpty()
  name: string;
}
