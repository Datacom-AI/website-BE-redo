import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class PreferencesApplicationUpdateDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  language?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  theme?: string;

  @IsOptional()
  @IsBoolean()
  compactSidebarEnabled?: boolean;
}
