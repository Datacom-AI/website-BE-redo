import { AccountStatus, PresenceStatus, UserRole } from 'generated/prisma';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class UserRawDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @IsEnum(PresenceStatus)
  presenceStatus: PresenceStatus;

  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus: AccountStatus;
}
