import { IsBoolean, IsOptional } from 'class-validator';

export class PreferencesNotificationUpdateDTO {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  messageNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  connectionNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;
}
