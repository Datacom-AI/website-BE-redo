import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderUpdateDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;
}
