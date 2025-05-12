import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartnershipType, PartnershipTier } from 'generated/prisma';

export class PartnershipUpdateDTO {
  @IsOptional()
  @IsString()
  partnershipType?: string;

  @IsOptional()
  @IsString()
  agreementDetails?: string;

  @IsOptional()
  @IsString()
  creditTerms?: string;

  @IsOptional()
  @IsString()
  minimumOrderRequirements?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(PartnershipTier)
  partnershipTier?: PartnershipTier;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;
}
