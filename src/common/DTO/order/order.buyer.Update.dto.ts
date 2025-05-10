import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class OrderBuyerUpdateDTO {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shippingNotes?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;
}
