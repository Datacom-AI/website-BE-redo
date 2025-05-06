import { IsBoolean, IsOptional } from 'class-validator';

export class SecuritySettingsUpdateDTO {
  @IsOptional()
  @IsBoolean()
  twoFactorAuthentication?: boolean;

  @IsOptional()
  @IsBoolean()
  twoFactorConfirmed?: boolean;

  @IsOptional()
  @IsBoolean()
  alertNewLogin?: boolean;

  @IsOptional()
  @IsBoolean()
  alertNewDeviceLogin?: boolean;

  @IsOptional()
  @IsBoolean()
  alertPasswordChanges?: boolean;

  @IsOptional()
  @IsBoolean()
  alertSuspiciousActivity?: boolean;
}
