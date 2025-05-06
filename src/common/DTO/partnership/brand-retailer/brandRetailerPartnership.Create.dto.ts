import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class BrandRetailerPartnershipCreateDTO {
  @IsNotEmpty()
  @IsUUID('4')
  retailerUserId: string;

  @IsNotEmpty()
  @IsUUID('4')
  brandUserId: string;

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
