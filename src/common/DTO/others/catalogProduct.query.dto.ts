import {
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ProductType, UnitType } from 'generated/prisma';
import { Type } from 'class-transformer';

export class CatalogProductQueryDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  productCategoryId?: string;

  @IsOptional()
  @IsUUID()
  manufacturerProfileId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSustainableProduct?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  orderBy?: string; // field to sort: e.g. "pricePerUnit", "name", "createdAt" etc.

  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc' = 'asc'; // sort direction: "asc" or "desc"
}
