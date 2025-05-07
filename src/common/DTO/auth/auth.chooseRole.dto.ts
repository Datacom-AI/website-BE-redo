import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthChooseRoleDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  role: string;
}
