import { UserRole } from 'generated/prisma';

export class CompanyInformationReadPublicDTO {
  id: string;
  name: string;

  companyWebsite?: string | null;
  addressCity?: string | null;
  addressCountry?: string | null;
}

export class SocialReadDTO {
  id: string;
  platform: string;
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

  jobTitle?: string | null;
  profileImageUrl?: string | null;
  bannerImageUrl?: string | null;
  professionalBio?: string | null;

  companyInfo?: CompanyInformationReadPublicDTO | null;
  socialLinks?: SocialReadDTO[] | null;

  isProfilePublic: boolean;

  createdAt: Date;

  manufacturerProfile?: ManufacturerProfileReadPublicDTO | null;
  brandProfile?: BrandProfileReadPublicDTO | null;
  retailerProfile?: RetailerProfileReadPublicDTO | null;
}
