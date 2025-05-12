import {
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { UserRole } from 'generated/prisma';
import { ArePasswordMatching } from 'src/common/decorators/passwordMatching.decorator';

export class AuthRegisterDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @ArePasswordMatching('password', {
    message: 'Passwords do not match',
  })
  confirmPassword: string;
}
