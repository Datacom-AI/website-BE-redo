import { UserRole } from 'generated/prisma';

export interface Payload {
  id: string;
  email: string;
  role: UserRole;
}
