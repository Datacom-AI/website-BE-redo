import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class RetailerManufacturerPartnershipCreateDTO {
  @IsNotEmpty()
  @IsUUID('4')
  manufacturerUserId: string;

  @IsNotEmpty()
  @IsUUID('4')
  retailerUserId: string;

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
