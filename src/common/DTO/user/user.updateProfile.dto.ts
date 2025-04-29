import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Status } from 'generated/prisma';

export class UserUpdateProfileDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  jobTitle?: string;

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  profileImageUrl?: string;

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  bannerImageUrl?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  professionalBio?: string;

  @IsOptional()
  @IsBoolean()
  isProfilePublic?: boolean;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
