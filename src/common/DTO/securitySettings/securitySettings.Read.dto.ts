export class SecuritySettingsReadDTO {
  id: string;
  userId: string;

  twoFactorAuthentication: boolean;
  twoFactorConfirmed: boolean;
  alertNewLogin: boolean;
  alertNewDeviceLogin: boolean;
  alertPasswordChanges: boolean;
  alertSuspiciousActivity: boolean;

  createdAt: Date;
  updatedAt: Date;
}
