import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsUrl,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { UnitType, ProductType, LeadTimeUnit } from 'generated/prisma';

export class ProductCatalogReadDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsUUID()
  productCategoryId?: string;

  @IsOptional()
  @IsInt()
  dailyCapacity?: number;

  @IsOptional()
  @IsEnum(UnitType)
  unitType?: UnitType;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  currentAvailableStock?: number;

  @IsOptional()
  @IsNumber()
  pricePerUnit?: number;

  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  leadTime?: string;

  @IsOptional()
  @IsEnum(LeadTimeUnit)
  leadTimeUnit?: LeadTimeUnit;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isSustainableProduct?: boolean;
}
