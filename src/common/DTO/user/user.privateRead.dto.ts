import { UserRole, Status } from 'generated/prisma';
import { SocialReadDTO } from './user.readPublic.dto';
import { CompanyInformationReadDTO } from '../company/company.informationRead.dto';
import { NotificationPreferencesReadDTO } from '../others/notificationPreferencesRead.dto';
import { SecuritySettingsReadDTO } from '../others/securitySettingsRead.dto';
import { ApplicationPreferencesReadDTO } from '../others/applicationPreferencesRead.dto';
import { ManufacturerProfileReadDTO } from '../manufacturer/manufacturer.profileRead.dto';
import { BrandProfileReadDTO } from '../others/brandProfileRead.dto';
import { RetailerProfileReadDTO } from '../others/retailerProfileRead.dto';

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
  notificationPreferences?: NotificationPreferencesReadDTO;
  securitySettings?: SecuritySettingsReadDTO;
  applicationPreferences?: ApplicationPreferencesReadDTO;
  socialLinks?: SocialReadDTO[];

  manufacturerProfile?: ManufacturerProfileReadDTO;
  brandProfile?: BrandProfileReadDTO;
  retailerProfile?: RetailerProfileReadDTO;

  isProfilePublic: boolean;

  createdAt: Date;
  updatedAt: Date;
}
