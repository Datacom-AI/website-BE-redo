import { IsOptional, IsString, IsUrl } from 'class-validator';

export class SocialUpdateDTO {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;
}
