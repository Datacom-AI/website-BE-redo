import { Injectable, NotFoundException } from '@nestjs/common';

import {
  BrandProfileReadPublicDTO,
  RetailerProfileReadPublicDTO,
  UserReadPublicDTO,
} from 'src/common/DTO/user/user.public.Read.dto';
import { UserReadPrivateDTO } from 'src/common/DTO/user/user.private.Read.dto';
import { UserReadMinimalDTO } from '../DTO/others/userMinimal.Read.dto';
import {
  CompanyInformationReadPublicDTO,
  SocialReadDTO,
} from 'src/common/DTO/user/user.public.Read.dto';
import { CompanyInformationReadDTO } from 'src/common/DTO/company/company.information.Read.dto';
import { SecuritySettingsReadDTO } from 'src/common/DTO/securitySettings/securitySettings.Read.dto';
import { PreferencesApplicationReadDTO } from 'src/common/DTO/preferences/preferences.application.Read.dto';
import { ManufacturerProfileReadDTO } from 'src/common/DTO/manufacturer/manufacturer.profile.Read.dto';
import { BrandProfileReadDTO } from 'src/common/DTO/brand/brand.profile.Read.dto';
import { RetailerProfileReadDTO } from 'src/common/DTO/retailer/retailer.profile.Read.dto';
import { MaterialHandleReadDTO } from '../DTO/materialHandle/materialHandle.Read.dto';
import { SpecialtyReadDTO } from 'src/common/DTO/specialty/specialty.Read.dto';
import { ManufacturingCapabilityReadDTO } from 'src/common/DTO/manufacturingCapability/manufacturingCapability.Read.dto';
import { PreferencesNotificationReadDTO } from 'src/common/DTO/preferences/preferences.notification.Read.dto';
import { CompanyTagReadDTO } from 'src/common/DTO/company/company.tag.Read.dto';
import { CompanyInformationMinimalReadDTO } from '../DTO/others/companyInformationMinimal.Read.dto';

@Injectable()
export class UserMapperService {
  toUserReadPublicDTO(user: any): UserReadPublicDTO {
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      jobTitle: user.jobTitle,
      profileImageUrl: user.profileImageUrl,
      bannerImageUrl: user.bannerImageUrl,
      professionalBio: user.professionalBio,
      isProfilePublic: user.isProfilePublic,
      createdAt: user.createdAt,
      companyInfo: user.companyInfo
        ? this.toCompanyInformationReadPublicDTO(user.companyInfo)
        : null,
      socialLinks: user.socialLinks
        ? user.socialLinks.map((social) => this.toSocialReadDTO(social))
        : null,
      manufacturerProfile: user.manufacturerProfile
        ? this.toManufacturerProfileReadPublicDTO(user.manufacturerProfile)
        : null,
      brandProfile: user.brandProfile
        ? this.toBrandProfileReadPublicDTO(user.brandProfile)
        : null,
      retailerProfile: user.retailerProfile
        ? this.toRetailerProfileReadPublicDTO(user.retailerProfile)
        : null,
    };
  }

  toUserReadPrivateDTO(
    user: any,
    counts?: { manufacturer?: any; brand?: any; retailer?: any },
  ): UserReadPrivateDTO {
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
      jobTitle: user.jobTitle,
      profileImageUrl: user.profileImageUrl,
      bannerImageUrl: user.bannerImageUrl,
      professionalBio: user.professionalBio,
      isProfilePublic: user.isProfilePublic,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      socialLinks: user.socialLinks
        ? user.socialLinks.map((social) => this.toSocialReadDTO(social))
        : null,
      companyInfo: user.companyInfo
        ? this.toCompanyInformationReadDTO(user.companyInfo)
        : null,
      notificationPreferences: user.notificationPreferences
        ? this.toNotificationPreferencesReadDTO(user.notificationPreferences)
        : null,
      securitySettings: user.securitySettings
        ? this.toSecuritySettingsReadDTO(user.securitySettings)
        : null,
      applicationPreferences: user.applicationPreferences
        ? this.toApplicationPreferencesReadDTO(user.applicationPreferences)
        : null,
      manufacturerProfile: user.manufacturerProfile
        ? this.toManufacturerProfileReadDTO(
            user.manufacturerProfile,
            counts?.manufacturer,
          )
        : null,
      brandProfile: user.brandProfile
        ? this.toBrandProfileReadDTO(user.brandProfile, counts?.brand)
        : null,
      retailerProfile: user.retailerProfile
        ? this.toRetailerProfileReadDTO(user.retailerProfile, counts?.retailer)
        : null,
    };
  }

  toUserReadMinimalDTO(user: any): UserReadMinimalDTO {
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      companyInfo: user.companyInfo
        ? this.toCompanyInformationMinimalReadDTO(user.companyInfo)
        : null,
    };
  }

  toCompanyInformationReadPublicDTO(
    companyInfo: any,
  ): CompanyInformationReadPublicDTO {
    if (!companyInfo) {
      throw new NotFoundException('Company information not found');
    }

    return companyInfo;
  }

  toSocialReadDTO(social: any): SocialReadDTO {
    if (!social) {
      throw new NotFoundException('Social link not found');
    }
    return {
      id: social.id,
      platform: social.platform,
      url: social.url,
    };
  }

  toManufacturerProfileReadPublicDTO(profile: any): ManufacturerProfileReadDTO {
    if (!profile) {
      throw new NotFoundException('Manufacturer profile not found');
    }

    return profile;
  }

  toBrandProfileReadPublicDTO(profile: any): BrandProfileReadPublicDTO {
    if (!profile) {
      throw new NotFoundException('Brand profile not found');
    }
    return {
      id: profile.id,
    };
  }

  toRetailerProfileReadPublicDTO(profile: any): RetailerProfileReadPublicDTO {
    if (!profile) {
      throw new NotFoundException('Retailer profile not found');
    }
    return {
      id: profile.id,
    };
  }

  toCompanyInformationReadDTO(
    companyInfo: any,
  ): CompanyInformationReadDTO | null {
    if (!companyInfo) return null;
    return {
      id: companyInfo.id,
      userId: companyInfo.userId,
      name: companyInfo.name,
      companyEmail: companyInfo.companyEmail,
      phoneNumber: companyInfo.phoneNumber,
      companyWebsite: companyInfo.companyWebsite,
      establishedYear: companyInfo.establishedYear,
      industry: companyInfo.industry,
      companySize: companyInfo.companySize,
      speciallization: companyInfo.speciallization,
      companySubtitle: companyInfo.companySubtitle,
      addressStreet: companyInfo.addressStreet,
      addressCity: companyInfo.addressCity,
      addressState: companyInfo.addressState,
      addressZipCode: companyInfo.addressZipCode,
      addressCountry: companyInfo.addressCountry,
      companyDescription: companyInfo.companyDescription,
      tags: companyInfo.tags
        ? companyInfo.tags.map((tag) => this.toCompanyTagReadDTO(tag))
        : null,
      createdAt: companyInfo.createdAt,
      updatedAt: companyInfo.updatedAt,
    };
  }

  toCompanyTagReadDTO(tag: any): CompanyTagReadDTO {
    if (!tag) {
      throw new NotFoundException('Company tag not found');
    }

    return tag;
  }

  toNotificationPreferencesReadDTO(prefs: any): PreferencesNotificationReadDTO {
    if (!prefs) {
      throw new NotFoundException('Notification preferences not found');
    }

    return prefs;
  }

  toSecuritySettingsReadDTO(settings: any): SecuritySettingsReadDTO {
    if (!settings) {
      throw new NotFoundException('Security settings not found');
    }
    return settings;
  }

  toApplicationPreferencesReadDTO(prefs: any): PreferencesApplicationReadDTO {
    if (!prefs) {
      throw new NotFoundException('Application preferences not found');
    }
    return {
      id: prefs.id,
      language: prefs.language,
      theme: prefs.theme,
      compactSidebarEnabled: prefs.compactSidebarEnabled,
      createdAt: prefs.createdAt,
      updatedAt: prefs.updatedAt,
    };
  }

  toManufacturingCapabilityReadDTO(cap: any): ManufacturingCapabilityReadDTO {
    if (!cap) {
      throw new NotFoundException('Manufacturing capability not found');
    }
    return {
      id: cap.id,
      productionCapacity: cap.productionCapacity,
      minimumOrderQuantity: cap.minimumOrderQuantity,
      materialHandles: cap.materialHandles
        ? cap.materialsHandled.map((m) => this.toMaterialHandledReadDTO(m))
        : null,
      specialties: cap.specialties
        ? cap.specialties.map((s) => this.toSpecialtyReadDTO(s))
        : null,
      createdAt: cap.createdAt,
      updatedAt: cap.updatedAt,
    };
  }

  toMaterialHandledReadDTO(item: any): MaterialHandleReadDTO {
    if (!item) {
      throw new NotFoundException('Material handle not found');
    }

    return item;
  }

  toSpecialtyReadDTO(item: any): SpecialtyReadDTO {
    if (!item) {
      throw new NotFoundException('Specialty not found');
    }
    return item;
  }

  toManufacturerProfileReadDTO(
    profile: any,
    counts?: any,
  ): ManufacturerProfileReadDTO {
    if (!profile) {
      throw new NotFoundException('Manufacturer profile not found');
    }
    return {
      id: profile.id,
      userId: profile.userId,
      isVerifiedManufacturer: profile.isVerifiedManufacturer,
      showProductionCapacity: profile.showProductionCapacity,
      showCertifications: profile.showCertifications,
      manufacturingCapability: profile.manufacturingCapability
        ? this.toManufacturingCapabilityReadDTO(profile.manufacturingCapability)
        : null,
      productsCount: counts?.productsCount,
      inventoryItemsCount: counts?.inventoryItemsCount,
      certificationCount: counts?.certificationCount,
      productionLinesCount: counts?.productionLinesCount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  toBrandProfileReadDTO(profile: any, counts?: any): BrandProfileReadDTO {
    if (!profile) {
      throw new NotFoundException('Brand profile not found');
    }

    return profile;
  }

  toRetailerProfileReadDTO(profile: any, counts?: any): RetailerProfileReadDTO {
    if (!profile) {
      throw new NotFoundException('Retailer profile not found');
    }

    return profile;
  }

  toCompanyInformationMinimalReadDTO(
    companyInfo: any,
  ): CompanyInformationMinimalReadDTO {
    if (!companyInfo) {
      throw new NotFoundException('Company information not found');
    }
    return {
      id: companyInfo.id,
      name: companyInfo.name,
    };
  }
}
