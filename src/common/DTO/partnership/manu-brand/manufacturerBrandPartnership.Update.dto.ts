import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class ManufacturerBrandPartnershipUpdateDTO {
  @IsOptional()
  @IsString()
  partnershipType?: string;

  @IsOptional()
  @IsString()
  agreementDetails?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  partnershipStartDate?: string;

  @IsOptional()
  @IsDateString()
  partnershipEndDate?: string;

  @IsOptional()
  @IsString()
  partnershipTier?: string;
}
