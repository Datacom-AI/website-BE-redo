import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ArePasswordMatching } from 'src/common/decorators/passwordMatching.decorator';

export class UserUpdateCredentialDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsString()
  @ValidateIf((o) => o.oldPassword !== undefined)
  @IsNotEmpty()
  newPassword?: string;

  @IsString()
  @ValidateIf((o) => o.oldPassword !== undefined)
  @IsNotEmpty()
  @ArePasswordMatching('newPassword', { message: 'Passwords do not match' })
  confirmPassword?: string;
}
