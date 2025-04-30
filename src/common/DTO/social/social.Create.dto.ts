import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SocialCreateDTO {
  @IsNotEmpty()
  @IsString()
  platform: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  url: string;
}
