import { IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDTO {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
