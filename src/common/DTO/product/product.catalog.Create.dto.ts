import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsNumber,
  IsUrl,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { UnitType, ProductType, LeadTimeUnit } from 'generated/prisma';
import { Type } from 'class-transformer'; // <--- Add Type import for transformations

export class ProductCatalogCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID('4')
  productCategoryId: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  minimumOrderQuantity: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  dailyCapacity: number;

  @IsOptional()
  @IsEnum(UnitType)
  unitType?: UnitType;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  currentAvailableStock: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  pricePerUnit: number;

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
  @IsBoolean()
  @Type(() => Boolean)
  isSustainableProduct?: boolean;

  @IsNotEmpty()
  @IsString()
  productSKU: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isBestSeller?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPopular?: boolean;
}
