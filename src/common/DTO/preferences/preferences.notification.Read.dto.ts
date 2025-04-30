export class PreferencesNotificationReadDTO {
  id: string;

  emailNotifications: boolean;
  messageNotifications: boolean;
  matchNotifications: boolean;
  marketingEmails: boolean;

  createdAt: Date;
  updatedAt: Date;
}
