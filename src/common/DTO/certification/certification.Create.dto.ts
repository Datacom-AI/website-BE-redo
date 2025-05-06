import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CertificationCreateDTO {
  @IsNotEmpty()
  @IsUUID('4')
  manufacturerProfileId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  issuingOrganization?: string;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificationCompliance?: string[];
}
