import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class AuthLoginUserDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
