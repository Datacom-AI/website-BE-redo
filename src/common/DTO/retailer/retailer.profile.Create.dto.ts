import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RetailerProfileCreateDTO {
  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsString()
  storeFormat?: string;

  @IsOptional()
  @IsString()
  averageStoreSize?: string;

  @IsOptional()
  @IsString()
  customerBaseDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  totalSkus?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activeCustomerCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  averageMonthlySales?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salesGrowthRateYoY?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  inventoryInStockPercentage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fulfillmentPercentage?: number;

  @IsOptional()
  @IsObject()
  topSellingCategoriesJson?: any;

  @IsOptional()
  @IsObject()
  customerDemographicsJson?: any;

  @IsOptional()
  @IsObject()
  purchaseFrequencyJson?: any;
}
