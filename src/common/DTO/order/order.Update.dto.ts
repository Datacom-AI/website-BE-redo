import {
  IsOptional,
  IsInt,
  IsPositive,
  IsEnum,
  IsString,
  MaxLength,
} from 'class-validator';
import { OrderStatus } from 'generated/prisma';

export class OrderUpdateDTO {
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shippingNotes?: string;
}
