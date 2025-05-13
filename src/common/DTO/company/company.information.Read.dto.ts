import { CompanyTagReadDTO } from './company.tag.Read.dto';

export class CompanyInformationReadDTO {
  id: string;
  userId: string;

  name: string;
  companyEmail?: string;
  phoneNumber?: string;
  companyWebsite?: string;
  establishedYear?: number;

  industry?: string;
  companySize?: string;
  speciallization?: string;
  companySubtitle?: string;

  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  addressCountry?: string;

  companyDescription?: string;

  tags?: CompanyTagReadDTO[];

  createdAt: Date;
  updatedAt: Date;
}
