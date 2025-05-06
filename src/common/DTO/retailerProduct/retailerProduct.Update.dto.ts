import {
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RetailerProductUpdateDTO {
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stockLevel?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  needsRestock?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reorderPoint?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;
}
