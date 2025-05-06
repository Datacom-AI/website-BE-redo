import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { Status } from 'generated/prisma';

export class UserUpdateProfileDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @IsOptional()
  @IsUrl()
  bannerImageUrl?: string;

  @IsOptional()
  @IsString()
  professionalBio?: string;

  @IsOptional()
  @IsBoolean()
  isProfilePublic?: boolean;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
