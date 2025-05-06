import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BrandProfileCreateDTO {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  growthRateYoY?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  marketPenetrationPercentage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  marketSharePercentage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estimatedShopperReachK?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalRetailerSales?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productFeatures?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brandCertifications?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sustainabilityClaims?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  totalSocialMediaFollowers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  averageEngagementRate?: number;
}
