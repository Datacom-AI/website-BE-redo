import {
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { UserRole } from 'generated/prisma';
import { ArePasswordMatching } from 'src/common/decorators/passwordMatching.decorator';

export class AuthRegisterUserDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @ArePasswordMatching('password', {
    message: 'Passwords do not match',
  })
  confirmPassword: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyName?: string;
}
