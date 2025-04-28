import { Status, UserRole } from 'generated/prisma';

export class UserRawDTO {
  email: string;
  username: string;
  password: string;
  companyName: string;
  role: UserRole;
  status: Status;
}
