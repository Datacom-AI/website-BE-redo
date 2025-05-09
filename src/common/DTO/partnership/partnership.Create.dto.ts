import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { PartnershipType, PartnershipTier } from 'generated/prisma';

export class PartnershipCreateDTO {
  @IsString()
  userTwoId: string;

  @IsEnum(PartnershipType)
  type: PartnershipType;

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
