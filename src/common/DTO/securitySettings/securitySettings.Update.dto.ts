import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SecuritySettingsUpdateDTO {
  @IsOptional()
  @IsBoolean()
  twoFactorAuthentication?: boolean;

  @IsOptional()
  @IsString()
  twoFactorSecret?: string;

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

  @IsOptional()
  @IsBoolean()
  generateNewBackupCodes?: boolean;
}
