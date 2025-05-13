import { UserRole } from 'generated/prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  profileId?: string;
}
