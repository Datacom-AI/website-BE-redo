import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class AuthLoginDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
