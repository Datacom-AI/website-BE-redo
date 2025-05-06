import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class RetailerManufacturerPartnershipUpdateDTO {
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
  @IsString()
  partnershipTier?: string;

  @IsOptional()
  @IsDateString()
  partnershipStartDate?: string;

  @IsOptional()
  @IsDateString()
  partnershipEndDate?: string;
}
