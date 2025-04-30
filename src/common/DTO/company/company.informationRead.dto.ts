import { CompanyTagReadDTO } from './company.tagRead.dto';

export class CompanyInformationReadDTO {
  id: string;

  name: string;
  companyEmail?: string;
  phoneNumber?: string;
  companyWebsite?: string;
  establishedYear?: number;

  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;

  companyDescription?: string;

  tags?: CompanyTagReadDTO[];

  createdAt: Date;
  updatedAt: Date;
}
