import { UserReadMinimalDTO } from '../others/userMinimal.Read.dto';
import { MatchUserStatusReadDTO } from './match.userStatus.Read.dto';

export class MatchReadDTO {
  id: string;

  userOne: UserReadMinimalDTO;
  userTwo: UserReadMinimalDTO;

  establishedAt?: Date | null;
  terminatedAt?: Date | null;

  currentUserStatus?: MatchUserStatusReadDTO | null;

  createdAt: Date;
  updatedAt: Date;
}
