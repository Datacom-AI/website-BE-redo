import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsUrl,
  IsBoolean,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { UnitType, ProductType, LeadTimeUnit } from 'generated/prisma';
import { Type } from 'class-transformer';

export class ProductCatalogUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID('4')
  productCategoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minimumOrderQuantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dailyCapacity?: number;

  @IsOptional()
  @IsEnum(UnitType)
  unitType?: UnitType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  currentAvailableStock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerUnit?: number;

  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

  @IsOptional()
  @IsString()
  leadTime?: string;

  @IsOptional()
  @IsEnum(LeadTimeUnit)
  leadTimeUnit?: LeadTimeUnit;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSustainableProduct?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isBestSeller?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPopular?: boolean;
}
