import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  Matches,
} from 'class-validator';
import { ArePasswordMatching } from 'src/common/decorators/passwordMatching.decorator';

export class UserUpdateCredentialDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  oldPassword?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.oldPassword)
  @IsNotEmpty()
  newPassword?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.oldPassword)
  @IsNotEmpty()
  @ArePasswordMatching('newPassword', { message: 'Passwords do not match' })
  confirmPassword?: string;
}
