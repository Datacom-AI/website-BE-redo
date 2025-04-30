import { IsNotEmpty, IsString } from 'class-validator';
import { ArePasswordMatching } from 'src/common/decorators/passwordMatching.decorator';

export class AdminUpdatePasswordDTO {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @ArePasswordMatching('newPassword', {
    message: 'Passwords do not match',
  })
  confirmPassword: string;
}
