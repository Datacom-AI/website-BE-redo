export class BackupCodeReadDTO {
  id: string;

  code: string;
  isUsed: boolean;
  usedAt?: Date | null;
  createdAt: Date;
}
