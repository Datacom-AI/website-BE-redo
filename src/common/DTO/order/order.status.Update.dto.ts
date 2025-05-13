import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from 'generated/prisma';

export class OrderStatusUpdateDTO {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
