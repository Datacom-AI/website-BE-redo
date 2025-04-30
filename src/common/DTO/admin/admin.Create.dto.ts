import { IsNotEmpty, IsString } from 'class-validator';
import { ArePasswordMatching } from 'src/common/decorators/passwordMatching.decorator';

export class AdminCreateDTO {
  @IsNotEmpty()
  @IsString()
  username: string;

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
