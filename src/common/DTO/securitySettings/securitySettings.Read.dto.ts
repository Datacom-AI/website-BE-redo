import { BackupCodeReadDTO } from './backupCode.Read.dto';

export class SecuritySettingsReadDTO {
  id: string;
  userId: string;

  twoFactorAuthentication: boolean;
  twoFactorConfirmed: boolean;
  alertNewLogin: boolean;
  alertNewDeviceLogin: boolean;
  alertPasswordChanges: boolean;
  alertSuspiciousActivity: boolean;

  backupCodes: BackupCodeReadDTO[];

  createdAt: Date;
  updatedAt: Date;
}
