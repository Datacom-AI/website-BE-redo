import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CustomerUpdateDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  oldPassword: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.oldPassword)
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.oldPassword)
  @IsNotEmpty()
  confirmPassword: string;
}
