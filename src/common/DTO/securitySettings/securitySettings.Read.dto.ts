export class SecuritySettingsReadDTO {
  id: string;

  twoFactorAuthenticationEnabled?: boolean;
  twoFactorConfirmed?: boolean;

  alertNewLogin?: boolean;
  alertNewDeviceLogin?: boolean;
  alertPasswordChange?: boolean;
  alertSuspiciousActivity?: boolean;

  createdAt: Date;
  updatedAt: Date;
}
