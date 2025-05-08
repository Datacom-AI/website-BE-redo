// import {
//   IsString,
//   IsOptional,
//   IsBoolean,
//   IsUrl,
//   IsEnum,
// } from 'class-validator';
// import { Status } from 'generated/prisma';

// export class UserUpdateProfileDTO {
//   @IsOptional()
//   @IsString()
//   name?: string;

//   @IsOptional()
//   @IsString()
//   jobTitle?: string;

//   @IsOptional()
//   @IsUrl()
//   profileImageUrl?: string;

//   @IsOptional()
//   @IsUrl()
//   bannerImageUrl?: string;

//   @IsOptional()
//   @IsString()
//   professionalBio?: string;

//   @IsOptional()
//   @IsBoolean()
//   isProfilePublic?: boolean;

//   @IsOptional()
//   @IsEnum(Status)
//   status?: Status;
// }

import {
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
  IsArray,
} from 'class-validator';
import { ManufacturerProfileReadDTO } from '../manufacturer/manufacturer.profile.Read.dto';
import { BrandProfileReadDTO } from '../brand/brand.profile.Read.dto';
import { RetailerProfileReadDTO } from '../retailer/retailer.profile.Read.dto';
import { SocialReadDTO } from './user.public.Read.dto';
import { CompanyInformationReadDTO } from '../company/company.information.Read.dto';

export class UserUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  professionalBio?: string;

  @IsOptional()
  @IsBoolean()
  isProfilePublic?: boolean;

  @IsOptional()
  @IsArray()
  socialLinks?: SocialReadDTO[];

  @IsOptional()
  @IsObject()
  companyInfo?: CompanyInformationReadDTO;

  @IsOptional()
  @IsObject()
  manufacturerProfile?: ManufacturerProfileReadDTO;

  @IsOptional()
  @IsObject()
  brandProfile?: BrandProfileReadDTO;

  @IsOptional()
  @IsObject()
  retailerProfile?: RetailerProfileReadDTO;
}
