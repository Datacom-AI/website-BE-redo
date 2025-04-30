import { IsNotEmpty, IsString } from 'class-validator';
import { ArePasswordMatching } from 'src/common/decorators/passwordMatching.decorator';

export class AuthResetPasswordDTO {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @ArePasswordMatching('password', {
    message: 'Passwords do not match',
  })
  confirmPassword: string;
}
