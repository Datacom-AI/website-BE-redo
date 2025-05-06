import { CompanyTagReadDTO } from './company.tag.Read.dto';

export class CompanyInformationReadDTO {
  id: string;
  userId: string;

  name: string;
  companyEmail?: string | null;
  phoneNumber?: string | null;
  companyWebsite?: string | null;
  establishedYear?: number | null;

  industry?: string | null;
  companySize?: string | null;
  speciallization?: string | null;
  companySubtitle?: string | null;

  addressStreet?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressZipCode?: string | null;
  addressCountry?: string | null;

  companyDescription?: string | null;

  tags?: CompanyTagReadDTO[];

  createdAt: Date;
  updatedAt: Date;
}
