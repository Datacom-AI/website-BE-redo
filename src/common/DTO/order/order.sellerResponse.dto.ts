import { IsIn, IsNotEmpty } from 'class-validator';

export class OrderSellerResponseDTO {
  @IsNotEmpty()
  @IsIn(['accept', 'reject'])
  action: 'accept' | 'reject';
}
