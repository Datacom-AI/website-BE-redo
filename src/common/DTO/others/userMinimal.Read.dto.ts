import { UserRole } from 'generated/prisma';
import { CompanyInformationMinimalReadDTO } from './companyInformationMinimal.Read.dto';

export class UserReadMinimalDTO {
  id: string;

  name: string;

  role: UserRole;
  profileImageUrl: string;

  companyInfo?: CompanyInformationMinimalReadDTO;
}
