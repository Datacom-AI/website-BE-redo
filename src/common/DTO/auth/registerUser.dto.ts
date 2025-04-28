import { IsNotEmpty, IsEmail, IsEnum, IsString } from 'class-validator';

enum UserRole {
  manufacturer = 'manufacturer',
  retailer = 'retailer',
  brand = 'brand',
}

enum UserStatus {
  active = 'active',
  inactive = 'inactive',
}

export class RegisterUserDTO {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  companyName: string;

  @IsEnum(UserStatus)
  status: UserStatus;
}
