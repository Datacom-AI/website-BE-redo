import { Status, UserRole } from 'generated/prisma';

export class UserRawDTO {
  id: string;
  email: string;
  username: string;
  password: string;
  companyName: string;
  role: UserRole;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}
