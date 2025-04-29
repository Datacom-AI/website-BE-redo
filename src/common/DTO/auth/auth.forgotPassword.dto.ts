import { IsNotEmpty, IsEmail } from 'class-validator';

export class AuthForgotPasswordDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
