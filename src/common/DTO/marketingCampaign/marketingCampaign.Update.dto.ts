import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignStatus, CampaignType } from 'generated/prisma';

export class MarketingCampaignUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsEnum(CampaignType)
  campaignType?: CampaignType;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  marketingBudget?: number;

  @IsOptional()
  @IsObject()
  budgetAllocationJson?: any;
}
