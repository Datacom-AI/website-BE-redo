import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class OrderSellerResponseDTO {
  @IsNotEmpty()
  @IsString()
  @IsIn(['accept', 'reject'])
  action: 'accept' | 'reject';
}
