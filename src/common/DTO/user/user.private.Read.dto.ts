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

  jobTitle?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  professionalBio?: string;

  companyInfo?: CompanyInformationReadDTO;
  notificationPreferences?: PreferencesNotificationReadDTO;
  securitySettings?: SecuritySettingsReadDTO;
  applicationPreferences?: PreferencesApplicationReadDTO;
  socialLinks?: SocialReadDTO[];

  manufacturerProfile?: ManufacturerProfileReadDTO;
  brandProfile?: BrandProfileReadDTO;
  retailerProfile?: RetailerProfileReadDTO;

  isProfilePublic: boolean;

  createdAt: Date;
  updatedAt: Date;
}
