import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminUpdateProfileDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;
}
