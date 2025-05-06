import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class PreferencesApplicationUpdateDTO {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsBoolean()
  compactSidebarEnabled?: boolean;
}
