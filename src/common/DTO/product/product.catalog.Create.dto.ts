import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsNumber,
  IsUrl,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UnitType, ProductType, LeadTimeUnit } from 'generated/prisma';

export class ProductCatalogCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  minimumOrderQuantity: number;

  @IsNotEmpty()
  @IsInt()
  dailyCapacity: number;

  @IsOptional()
  @IsEnum(UnitType)
  unitType?: UnitType;

  @IsNotEmpty()
  @IsInt()
  currentAvailableStock: number;

  @IsNotEmpty()
  @IsNumber()
  pricePerUnit: number;

  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

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

  @IsNotEmpty()
  @IsString()
  productSKU: string;
}
