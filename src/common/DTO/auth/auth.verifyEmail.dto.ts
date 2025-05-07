import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthVerifyEmailDTO {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
