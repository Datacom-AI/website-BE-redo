import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsInt,
} from 'class-validator';

export class CompanyInformationCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  companyWebsite?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  establishedYear?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  addressStreet?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  addressCity?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  addressState?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  addressZipCode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyDescription?: string;
}
