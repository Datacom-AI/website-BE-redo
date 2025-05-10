import { IsInt, IsPositive, IsString } from 'class-validator';

export class OrderCreateDTO {
  @IsString()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}
