import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class OrderCreateDTO {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}
