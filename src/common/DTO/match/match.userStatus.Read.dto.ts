import { ConnectionStatus } from 'generated/prisma';

export class MatchUserStatusReadDTO {
  id: string;
  userId: string;
  matchId: string;

  status: ConnectionStatus;
  isStarred: boolean;

  createdAt: Date;
  updatedAt: Date;
}
