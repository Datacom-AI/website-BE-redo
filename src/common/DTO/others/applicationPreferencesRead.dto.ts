export class ApplicationPreferencesReadDTO {
  id: string;

  language: string;
  theme: string;
  compactSidebarEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;
}
