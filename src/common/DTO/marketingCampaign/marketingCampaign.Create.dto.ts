import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignStatus, CampaignType } from 'generated/prisma';

export class MarketingCampaignCreateDTO {
  @IsNotEmpty()
  @IsUUID('4')
  brandProfileId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

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
