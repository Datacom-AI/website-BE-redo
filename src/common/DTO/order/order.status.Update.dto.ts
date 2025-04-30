import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from 'generated/prisma';

export class OrderUpdateStatusDTO {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: string;
}
