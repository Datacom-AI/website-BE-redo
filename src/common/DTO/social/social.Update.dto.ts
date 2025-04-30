import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class SocialUpdateDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  platform?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url?: string;
}
