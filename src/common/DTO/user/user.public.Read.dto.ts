import { UserRole } from 'generated/prisma';

export class CompanyInformationReadPublicDTO {
  id: string;
  name: string;
  companyWebsite?: string;
  addressCity?: string;
  addressCountry?: string;
}

export class SocialReadDTO {
  id: string;
  name: string;
  url: string;
}

export class ManufacturerProfileReadPublicDTO {
  id: string;
  isVerifiedManufacturer: boolean;
}

export class BrandProfileReadPublicDTO {
  id: string;
}

export class RetailerProfileReadPublicDTO {
  id: string;
}

export class UserReadPublicDTO {
  id: string;
  name: string;
  role: UserRole;

  jobTitle?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  professionalBio?: string;

  companyInfo?: CompanyInformationReadPublicDTO;
  socialLinks?: SocialReadDTO[];

  isProfilePublic: boolean;

  createdAt: Date;

  manufacturerProfile?: ManufacturerProfileReadPublicDTO;
  brandProfile?: BrandProfileReadPublicDTO;
  retailerProfile?: RetailerProfileReadPublicDTO;
}
