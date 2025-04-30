import { UserReadMinimalDTO } from '../others/userMinimal.Read.dto';
import { MatchUserStatusReadDTO } from './match.userStatus.Read.dto';

export class MatchReadDTO {
  id: string;

  brand: UserReadMinimalDTO;
  manufacturer: UserReadMinimalDTO;

  description?: string;
  matchPercentage?: number;

  currentUserStatus?: MatchUserStatusReadDTO;

  createdAt: Date;
  updatedAt: Date;
}
