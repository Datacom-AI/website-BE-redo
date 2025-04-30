import { MatchingStatus } from 'generated/prisma';

export class MatchUserStatusReadDTO {
  id: string;
  userId: string;
  matchId: string;

  status: MatchingStatus;
  isStarred: boolean;

  createdAt: Date;
  updatedAt: Date;
}
