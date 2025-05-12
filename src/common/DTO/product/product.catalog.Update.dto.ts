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

// ...existing code...
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
  stockLevel?: number; // Renamed from currentAvailableStock

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
  image?: string; // Can be null to remove image

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSustainableProduct?: boolean;

  @IsOptional()
  @IsString()
  productSKU?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isBestSeller?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPopular?: boolean;
}
