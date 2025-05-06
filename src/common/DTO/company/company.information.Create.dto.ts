import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CompanyInformationCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsUrl()
  companyWebsite?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  establishedYear?: number;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  speciallization?: string;

  @IsOptional()
  @IsString()
  companySubtitle?: string;

  @IsOptional()
  @IsString()
  addressStreet?: string;

  @IsOptional()
  @IsString()
  addressCity?: string;

  @IsOptional()
  @IsString()
  addressState?: string;

  @IsOptional()
  @IsString()
  addressZipCode?: string;

  @IsOptional()
  @IsString()
  addressCountry?: string;

  @IsOptional()
  @IsString()
  companyDescription?: string;
}
