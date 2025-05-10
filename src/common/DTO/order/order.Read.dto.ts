import { OrderStatus } from 'generated/prisma';
import {
  ReviewAuthorReadDTO,
  ReviewProductReadDTO,
} from '../review/review.Read.dto';

export class OrderReadDTO {
  id: string;

  user: ReviewAuthorReadDTO;
  product: ReviewProductReadDTO;

  quantity: number;
  totalPrice: number;
  orderStatus: OrderStatus;

  createdAt: Date;
  updatedAt: Date;
}
