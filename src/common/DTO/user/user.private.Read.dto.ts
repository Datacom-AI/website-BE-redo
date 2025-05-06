import { UserRole, Status } from 'generated/prisma';
import { SocialReadDTO } from './user.public.Read.dto';
import { CompanyInformationReadDTO } from '../company/company.information.Read.dto';
import { PreferencesNotificationReadDTO } from '../preferences/preferences.notification.Read.dto';
import { SecuritySettingsReadDTO } from '../securitySettings/securitySettings.Read.dto';
import { PreferencesApplicationReadDTO } from '../preferences/preferences.application.Read.dto';
import { ManufacturerProfileReadDTO } from '../manufacturer/manufacturer.profile.Read.dto';
import { BrandProfileReadDTO } from '../brand/brand.profile.Read.dto';
import { RetailerProfileReadDTO } from '../retailer/retailer.profile.Read.dto';

export class UserReadPrivateDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: Status;
  jobTitle?: string | null;
  profileImageUrl?: string | null;
  bannerImageUrl?: string | null;
  professionalBio?: string | null;
  lastLogin?: Date | null;
  companyInfo?: CompanyInformationReadDTO | null;
  notificationPreferences?: PreferencesNotificationReadDTO | null;
  securitySettings?: SecuritySettingsReadDTO | null;
  applicationPreferences?: PreferencesApplicationReadDTO | null;
  socialLinks?: SocialReadDTO[] | null;
  manufacturerProfile?: ManufacturerProfileReadDTO | null;
  brandProfile?: BrandProfileReadDTO | null;
  retailerProfile?: RetailerProfileReadDTO | null;
  isProfilePublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
