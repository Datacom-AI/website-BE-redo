import { UserRole } from 'generated/prisma';

export interface Payload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
