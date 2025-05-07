import { UserRole } from 'generated/prisma';

export class UserReadMinimalDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
