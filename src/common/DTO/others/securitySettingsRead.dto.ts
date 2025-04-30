export class SecuritySettingsReadDTO {
  id: string;

  twoFactorAuthenticationEnabled: boolean;
  twoFactorConfirmedL: boolean;

  alertNewLogin: boolean;
  alertNewDeviceLogin: boolean;
  alertPasswordChange: boolean;
  alertSuspiciousActivity: boolean;

  createdAt: Date;
  updatedAt: Date;
}
