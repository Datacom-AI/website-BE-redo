import {
  IsOptional,
  IsString,
  IsEmail,
  IsUrl,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class CompanyInformationUpdateDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

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
  companyDescription?: string;
}
