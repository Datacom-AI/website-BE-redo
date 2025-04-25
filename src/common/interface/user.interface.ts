import { UserRole } from 'generated/prisma';

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole; // manufacturer, retailer, brand
  companyName: string;
  status: string; // active or inactive
}
