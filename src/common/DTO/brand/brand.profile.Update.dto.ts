import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  IsDate,
} from 'class-validator';

export class BrandProfileUpdateDTO {
  @IsOptional()
  @IsNumber()
  growthRateYoY?: number;

  @IsOptional()
  @IsNumber()
  marketPenetrationPercentage?: number;

  @IsOptional()
  @IsNumber()
  marketSharePercentage?: number;

  @IsOptional()
  @IsNumber()
  estimatedShopperReachK?: number;

  @IsOptional()
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
  @IsNumber()
  totalSocialMediaFollowers?: number;

  @IsOptional()
  @IsNumber()
  averageEngagementRate?: number;
}
