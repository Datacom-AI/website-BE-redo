import * as fs from 'fs/promises';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { UserUpdateDTO } from 'src/common/DTO/user/user.profile.Update.dto';
import { UserReadPrivateDTO } from 'src/common/DTO/user/user.private.Read.dto';
import { UserUpdateCredentialDTO } from 'src/common/DTO/user/user.credential.dto';
import { PreferencesNotificationUpdateDTO } from 'src/common/DTO/preferences/preferences.notification.Update.dto';
import { SecuritySettingsUpdateDTO } from 'src/common/DTO/securitySettings/securitySettings.Update.dto';
import { PreferencesApplicationUpdateDTO } from 'src/common/DTO/preferences/preferences.application.Update.dto';
import {
  BrandDetails,
  ManufacturerDetails,
  Profile,
  RetailerDetails,
  User,
  UserRole,
} from 'generated/prisma';
import {
  createImageName,
  saveImage,
  removeImage,
} from 'src/common/utils/image.utils';
import * as path from 'node:path';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private readonly logger = new Logger(UserService.name);

  private getUploadPath(subdir: 'profile-image' | 'banner-image'): string {
    const basePath =
      this.configService.get<string>('UPLOAD_PATH') || './uploads';
    return path.join(basePath, subdir);
  }

  private async ensureUploadPathExists(directory: string): Promise<void> {
    try {
      await fs.mkdir(directory, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create directory ${directory}:`, error);
      throw new BadRequestException(
        `Failed to create directory ${directory}: ${error.message}`,
      );
    }
  }

  private generateBackupCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private mapUserToDTO(
    user: User & {
      companyInfo?: any;
      notificationPreferences?: any;
      securitySettings?: any;
      applicationPreferences?: any;
      socialLinks?: any[];
      profile?: {
        manufacturerDetails?: any;
        brandDetails?: any;
        retailerDetails?: any;
      } | null;
    },
  ): UserReadPrivateDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      presenceStatus: user.presenceStatus,
      accountStatus: user.accountStatus,
      jobTitle: user.jobTitle,
      profileImage: user.profileImage,
      bannerImage: user.bannerImage,
      professionalBio: user.professionalBio,
      lastLogin: user.lastLogin,
      companyInfo: user.companyInfo,
      notificationPreferences: user.notificationPreferences,
      securitySettings: user.securitySettings
        ? {
            id: user.securitySettings.id,
            userId: user.securitySettings.userId,
            twoFactorAuthentication:
              user.securitySettings.twoFactorAuthentication,
            twoFactorConfirmed: user.securitySettings.twoFactorConfirmed,
            alertNewLogin: user.securitySettings.alertNewLogin,
            alertNewDeviceLogin: user.securitySettings.alertNewDeviceLogin,
            alertPasswordChanges: user.securitySettings.alertPasswordChanges,
            alertSuspiciousActivity:
              user.securitySettings.alertSuspiciousActivity,
            backupCodes: user.securitySettings.backupCodes?.map((code) => ({
              id: code.id,
              code: code.code,
              isUsed: code.isUsed,
              usedAt: code.usedAt,
              createdAt: code.createdAt,
            })),
            createdAt: user.securitySettings.createdAt,
            updatedAt: user.securitySettings.updatedAt,
          }
        : undefined,
      applicationPreferences: user.applicationPreferences,
      socialLinks: user.socialLinks,
      isProfilePublic: user.isProfilePublic,
      manufacturerProfile:
        user.role === 'manufacturer'
          ? user.profile?.manufacturerDetails
          : undefined,
      brandProfile:
        user.role === 'brand' ? user.profile?.brandDetails : undefined,
      retailerProfile:
        user.role === 'retailer' ? user.profile?.retailerDetails : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAllService(): Promise<UserReadPrivateDTO[]> {
    const users = await this.prisma.user.findMany({
      where: {},
      include: {
        companyInfo: true,
        notificationPreferences: true,
        securitySettings: true,
        applicationPreferences: true,
        socialLinks: true,
        profile: {
          include: {
            manufacturerDetails: true,
            brandDetails: true,
            retailerDetails: true,
          },
        },
      },
    });

    return users.map((user) => this.mapUserToDTO(user));
  }

  async findOneService(id: string): Promise<UserReadPrivateDTO> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          companyInfo: true,
          notificationPreferences: true,
          securitySettings: true,
          applicationPreferences: true,
          socialLinks: true,
          profile: {
            include: {
              manufacturerDetails: {
                include: {
                  manufacturingCapability: true,
                },
              },
              brandDetails: true,
              retailerDetails: true,
            },
          },
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return this.mapUserToDTO(user);
    } catch (error) {
      if (error.code === 'P2023') {
        throw new BadRequestException('Invalid ID provided');
      }
      throw error;
    }
  }

  async findByEmailService(email: string): Promise<UserReadPrivateDTO> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          companyInfo: true,
          notificationPreferences: true,
          securitySettings: true,
          applicationPreferences: true,
          socialLinks: true,
          profile: {
            include: {
              manufacturerDetails: {
                include: {
                  manufacturingCapability: true,
                },
              },
              brandDetails: true,
              retailerDetails: true,
            },
          },
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return this.mapUserToDTO(user);
    } catch (error) {
      if (error.code === 'P2023') {
        throw new BadRequestException('Invalid email provided');
      }
      throw error;
    }
  }

  async createUserService(userData: {
    email: string;
    name: string;
    password: string;
    role: UserRole;
  }): Promise<User> {
    try {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(userData.password, salt);

      const profileCreateNestedInput: any = {
        role: userData.role,
      };

      if (userData.role === UserRole.manufacturer) {
        profileCreateNestedInput.manufacturerDetails = { create: {} };
      } else if (userData.role === UserRole.brand) {
        profileCreateNestedInput.brandDetails = { create: {} };
      } else if (userData.role === UserRole.retailer) {
        profileCreateNestedInput.retailerDetails = { create: {} };
      }

      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          accountStatus: 'pendingVerification',
          presenceStatus: 'offline',
          isProfilePublic: false,
        },
      });

      await this.createProfileService(user.id, userData.role);
      const userDataReturn = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          profile: {
            include: {
              manufacturerDetails: true,
              brandDetails: true,
              retailerDetails: true,
            },
          },
        },
      });

      if (!userDataReturn || !userDataReturn.profile) {
        throw new NotFoundException(
          'User not found or profile created successfully',
        );
      }

      return userDataReturn;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw new BadRequestException('Invalid data provided');
    }
  }

  async createProfileService(userId: string, role: UserRole): Promise<Profile> {
    const user = await this.findOneService(userId);

    const profile = await this.prisma.profile.create({
      data: {
        userId,
        role: role,
      },
    });

    if (role === 'manufacturer') {
      await this.createManufacturerProfileService(profile.id);
    } else if (role === 'brand') {
      await this.createBrandProfileService(profile.id);
    } else if (role === 'retailer') {
      await this.createRetailerProfileService(profile.id);
    }

    return profile;
  }

  async createManufacturerProfileService(
    profileId: string,
  ): Promise<ManufacturerDetails> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      this.logger.error(
        `Profile with ID ${profileId} not found when creating manufacturer details.`,
      );
      throw new NotFoundException(`Profile with ID ${profileId} not found.`);
    }

    const manufacturerDetails = await this.prisma.manufacturerDetails.create({
      data: {
        profileId,
      },
    });

    return manufacturerDetails;
  }

  async createBrandProfileService(profileId: string): Promise<BrandDetails> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      this.logger.error(
        `Profile with ID ${profileId} not found when creating brand details.`,
      );
      throw new NotFoundException(`Profile with ID ${profileId} not found.`);
    }

    const brandDetails = await this.prisma.brandDetails.create({
      data: {
        profileId,
      },
    });

    return brandDetails;
  }

  async createRetailerProfileService(
    profileId: string,
  ): Promise<RetailerDetails> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      this.logger.error(
        `Profile with ID ${profileId} not found when creating retailer details.`,
      );
      throw new NotFoundException(`Profile with ID ${profileId} not found.`);
    }

    const retailerDetails = await this.prisma.retailerDetails.create({
      data: {
        profileId,
      },
    });

    return retailerDetails;
  }

  async deleteUserService(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profileImagePath = this.getUploadPath('profile-image');
    const bannerImagePath = this.getUploadPath('banner-image');

    if (user.profileImage) {
      try {
        await removeImage(path.join(profileImagePath, user.profileImage));
      } catch (error) {
        this.logger.warn(
          `Failed to remove profile image during user deletion: ${user.profileImage}`,
          error.message,
        );
      }
    }

    if (user.bannerImage) {
      try {
        await removeImage(path.join(bannerImagePath, user.bannerImage));
      } catch (error) {
        this.logger.warn(
          `Failed to remove banner image during user deletion: ${user.bannerImage}`,
          error.message,
        );
      }
    }

    await this.prisma.user.delete({
      where: { id },
    });
    this.logger.log(`User with ID ${id} has been permanently deleted.`);
  }

  async getProfile(userId: string): Promise<UserReadPrivateDTO> {
    return await this.findOneService(userId);
  }

  async updateProfileService(
    userId: string,
    userRole: UserRole,
    dto: UserUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    const updateData: any = {
      name: dto.name,
      jobTitle: dto.jobTitle,
      professionalBio: dto.professionalBio,
      isProfilePublic: dto.isProfilePublic,
    };

    if (dto.socialLinks) {
      updateData.socialLinks = {
        deleteMany: {},
        create: dto.socialLinks.map((link) => ({
          platform: link.platform,
          url: link.url,
        })),
      };
    }

    if (dto.companyInfo) {
      updateData.companyInfo = {
        upsert: {
          create: dto.companyInfo,
          update: dto.companyInfo,
        },
      };
    }

    if (dto.manufacturerProfile && userRole !== 'manufacturer') {
      throw new ForbiddenException(
        'Only manufacturers can update manufacturer profile',
      );
    }
    if (dto.brandProfile && userRole !== 'brand') {
      throw new ForbiddenException('Only brands can update brand profile');
    }
    if (dto.retailerProfile && userRole !== 'retailer') {
      throw new ForbiddenException(
        'Only retailers can update retailer profile',
      );
    }

    if (dto.manufacturerProfile || dto.brandProfile || dto.retailerProfile) {
      updateData.profile = {
        upsert: {
          create: {
            role: userRole,
            manufacturerDetails: dto.manufacturerProfile
              ? {
                  create: {
                    ...dto.manufacturerProfile,
                    manufacturingCapability: dto.manufacturingCapability
                      ? {
                          create: dto.manufacturingCapability,
                        }
                      : undefined,
                  },
                }
              : undefined,
            brandDetails: dto.brandProfile
              ? { create: dto.brandProfile }
              : undefined,
            retailerDetails: dto.retailerProfile
              ? { create: dto.retailerProfile }
              : undefined,
          },
          update: {
            manufacturerDetails: dto.manufacturerProfile
              ? {
                  update: {
                    ...dto.manufacturerProfile,
                    manufacturingCapability: dto.manufacturingCapability
                      ? {
                          upsert: {
                            create: dto.manufacturingCapability,
                            update: dto.manufacturingCapability,
                          },
                        }
                      : undefined,
                  },
                }
              : undefined,
            brandDetails: dto.brandProfile
              ? { update: dto.brandProfile }
              : undefined,
            retailerDetails: dto.retailerProfile
              ? { update: dto.retailerProfile }
              : undefined,
          },
        },
      };
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          companyInfo: true,
          notificationPreferences: true,
          securitySettings: true,
          applicationPreferences: true,
          socialLinks: true,
          profile: {
            include: {
              manufacturerDetails: {
                include: {
                  manufacturingCapability: true,
                },
              },
              brandDetails: true,
              retailerDetails: true,
            },
          },
        },
      });

      return this.mapUserToDTO(user);
    } catch (error) {
      this.logger.error('Profile update failed:', error);

      if (error.code === 'P2002') {
        throw new ConflictException(
          'Email or other unique field already exists',
        );
      }

      throw new BadRequestException('Invalid data provided');
    }
  }

  async updatePasswordService(
    userId: string,
    dto: UserUpdateCredentialDTO,
  ): Promise<UserReadPrivateDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!dto.oldPassword || !dto.newPassword || !dto.confirmPassword) {
      throw new BadRequestException('All password fields are required');
    }

    const isOldPasswordValid = await bcryptjs.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException(
        'New password and confirmation do not match',
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(dto.newPassword, salt);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      include: {
        companyInfo: true,
        notificationPreferences: true,
        securitySettings: true,
        applicationPreferences: true,
        socialLinks: true,
        profile: {
          include: {
            manufacturerDetails: {
              include: {
                manufacturingCapability: true,
              },
            },
            brandDetails: true,
            retailerDetails: true,
          },
        },
      },
    });

    return this.mapUserToDTO(updatedUser);
  }

  async updateNotificationPreferencesService(
    userId: string,
    dto: PreferencesNotificationUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: {
          upsert: {
            create: dto,
            update: dto,
          },
        },
      },
      include: {
        companyInfo: true,
        notificationPreferences: true,
        securitySettings: true,
        applicationPreferences: true,
        socialLinks: true,
        profile: {
          include: {
            manufacturerDetails: {
              include: {
                manufacturingCapability: true,
              },
            },
            brandDetails: true,
            retailerDetails: true,
          },
        },
      },
    });

    return this.mapUserToDTO(updatedUser);
  }

  async updateSecuritySettingsService(
    userId: string,
    dto: SecuritySettingsUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const securitySettings = await this.prisma.securitySettings.upsert({
      where: { userId },
      create: {
        userId,
        twoFactorAuthentication: dto.twoFactorAuthentication ?? false,
        twoFactorSecret: dto.twoFactorSecret,
        twoFactorConfirmed: dto.twoFactorConfirmed ?? false,
        alertNewLogin: dto.alertNewLogin ?? true,
        alertNewDeviceLogin: dto.alertNewDeviceLogin ?? false,
        alertPasswordChanges: dto.alertPasswordChanges ?? false,
        alertSuspiciousActivity: dto.alertSuspiciousActivity ?? false,
      },
      update: {
        twoFactorAuthentication: dto.twoFactorAuthentication,
        twoFactorSecret: dto.twoFactorSecret,
        twoFactorConfirmed: dto.twoFactorConfirmed,
        alertNewLogin: dto.alertNewLogin,
        alertNewDeviceLogin: dto.alertNewDeviceLogin,
        alertPasswordChanges: dto.alertPasswordChanges,
        alertSuspiciousActivity: dto.alertSuspiciousActivity,
      },
    });

    if (dto.generateNewBackupCodes) {
      await this.prisma.backupCode.deleteMany({
        where: { securitySettingsId: securitySettings.id },
      });

      const backupCodes = Array.from({ length: 10 }, () => ({
        securitySettingsId: securitySettings.id,
        code: this.generateBackupCode(),
        isUsed: false,
      }));

      await this.prisma.backupCode.createMany({
        data: backupCodes,
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        securitySettings: {
          upsert: {
            create: dto,
            update: dto,
          },
        },
      },
      include: {
        companyInfo: true,
        notificationPreferences: true,
        securitySettings: true,
        applicationPreferences: true,
        socialLinks: true,
        profile: {
          include: {
            manufacturerDetails: {
              include: {
                manufacturingCapability: true,
              },
            },
            brandDetails: true,
            retailerDetails: true,
          },
        },
      },
    });

    return this.mapUserToDTO(updatedUser);
  }

  async generateBackupCodesService(
    userId: string,
  ): Promise<UserReadPrivateDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { securitySettings: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let securitySettings = user.securitySettings;

    if (!securitySettings) {
      securitySettings = await this.prisma.securitySettings.create({
        data: {
          userId,
        },
      });
    }

    await this.prisma.backupCode.deleteMany({
      where: { securitySettingsId: securitySettings.id },
    });

    const backupCodesData = Array.from({ length: 10 }, () => ({
      securitySettingsId: securitySettings.id,
      code: this.generateBackupCode(),
      isUsed: false,
    }));

    await this.prisma.backupCode.createMany({
      data: backupCodesData,
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyInfo: true,
        notificationPreferences: true,
        securitySettings: {
          include: {
            backupCodes: true,
          },
        },
        applicationPreferences: true,
        socialLinks: true,
        profile: {
          include: {
            manufacturerDetails: {
              include: {
                manufacturingCapability: true,
              },
            },
            brandDetails: true,
            retailerDetails: true,
          },
        },
      },
    });

    if (!updatedUser) {
      throw new NotFoundException(
        'User not found after generating backup codes',
      );
    }

    return this.mapUserToDTO(updatedUser);
  }

  async verifyBackupCodeService(
    userId: string,
    code: string,
  ): Promise<{ valid: boolean; message?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        securitySettings: {
          include: { backupCodes: true },
        },
      },
    });

    if (!user || !user.securitySettings) {
      throw new NotFoundException('User or security settings not found');
    }

    const backupCode = user.securitySettings.backupCodes[0];

    if (!backupCode) {
      throw new NotFoundException('No backup codes found');
    }

    await this.prisma.backupCode.update({
      where: { id: backupCode.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    return { valid: true, message: 'Backup code verified successfully' };
  }

  async updateApplicationPreferencesService(
    userId: string,
    dto: PreferencesApplicationUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        applicationPreferences: {
          upsert: {
            create: dto,
            update: dto,
          },
        },
      },
      include: {
        companyInfo: true,
        notificationPreferences: true,
        securitySettings: true,
        applicationPreferences: true,
        socialLinks: true,
        profile: {
          include: {
            manufacturerDetails: {
              include: {
                manufacturingCapability: true,
              },
            },
            brandDetails: true,
            retailerDetails: true,
          },
        },
      },
    });

    return this.mapUserToDTO(updatedUser);
  }

  async uploadImagesService(
    userId: string,
    files: Express.Multer.File[],
  ): Promise<UserReadPrivateDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profileImagePath = this.getUploadPath('profile-image');
    const bannerImagePath = this.getUploadPath('banner-image');
    await this.ensureUploadPathExists(profileImagePath);
    await this.ensureUploadPathExists(bannerImagePath);

    const updateData: any = {};

    for (const file of files) {
      try {
        const imageName = createImageName(file);
        let imagePath: string;

        if (file.fieldname === 'profileImage') {
          imagePath = path.join(profileImagePath, imageName);
          if (user.profileImage) {
            await removeImage(path.join(profileImagePath, user.profileImage));
          }
          updateData.profileImage = imageName;
        } else if (file.fieldname === 'bannerImage') {
          imagePath = path.join(bannerImagePath, imageName);
          if (user.bannerImage) {
            await removeImage(path.join(bannerImagePath, user.bannerImage));
          }
          updateData.bannerImage = imageName;
        } else {
          this.logger.error(`Invalid field name: ${file.fieldname}`);
          throw new BadRequestException(
            `Invalid field name: ${file.fieldname}`,
          );
        }

        await saveImage(file, imagePath);
      } catch (error) {
        this.logger.error(`Failed to process image ${file.fieldname}:`, error);
        throw new BadRequestException(`Failed to upload ${file.fieldname}`);
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        companyInfo: true,
        notificationPreferences: true,
        securitySettings: true,
        applicationPreferences: true,
        socialLinks: true,
        profile: {
          include: {
            manufacturerDetails: {
              include: {
                manufacturingCapability: true,
              },
            },
            brandDetails: true,
            retailerDetails: true,
          },
        },
      },
    });

    return this.mapUserToDTO(updatedUser);
  }
}
