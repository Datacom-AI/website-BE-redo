import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RetailerProductCreateDTO {
  @IsNotEmpty()
  @IsUUID('4')
  retailerProfileId: string;

  @IsNotEmpty()
  @IsUUID('4')
  categoryId: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  stockLevel: number;

  @IsNotEmpty()
  @Type(() => Boolean)
  @IsBoolean()
  needsRestock: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reorderPoint?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;
}
