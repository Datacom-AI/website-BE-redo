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
import { User, UserRole } from 'generated/prisma';
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

  private readonly logger = new Logger(UserService.name);

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
      securitySettings: user.securitySettings,
      applicationPreferences: user.applicationPreferences,
      socialLinks: user.socialLinks,
      manufacturerProfile:
        user.role === 'manufacturer'
          ? user.profile?.manufacturerDetails
          : undefined,
      brandProfile:
        user.role === 'brand' ? user.profile?.brandDetails : undefined,
      retailerProfile:
        user.role === 'retailer' ? user.profile?.retailerDetails : undefined,
      isProfilePublic: user.isProfilePublic,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // CRUD Methods
  async findAllService(): Promise<UserReadPrivateDTO[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
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
        where: { id, deletedAt: null },
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
        where: { email, deletedAt: null },
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
  }): Promise<UserReadPrivateDTO> {
    try {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(userData.password, salt);
      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          accountStatus: 'pending',
          presenceStatus: 'offline',
          isProfilePublic: false,
        },
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
      return this.mapUserToDTO(user);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw new BadRequestException('Invalid data provided');
    }
  }

  async deleteUserService(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profileImagePath = this.getUploadPath('profile-image');
    const bannerImagePath = this.getUploadPath('banner-image');

    if (user.profileImage) {
      try {
        removeImage(path.join(profileImagePath, user.profileImage));
      } catch (error) {
        this.logger.error('Failed to remove profile image:', error);
      }
    }

    if (user.bannerImage) {
      try {
        removeImage(path.join(bannerImagePath, user.bannerImage));
      } catch (error) {
        this.logger.error('Failed to remove banner image:', error);
      }
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Profile Management
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

    // Handle socialLinks
    if (dto.socialLinks) {
      updateData.socialLinks = {
        deleteMany: {}, // Clear existing links
        create: dto.socialLinks.map((link) => ({
          platform: link.platform,
          url: link.url,
        })),
      };
    }

    // Handle companyInfo
    if (dto.companyInfo) {
      updateData.companyInfo = {
        upsert: {
          create: dto.companyInfo,
          update: dto.companyInfo,
        },
      };
    }

    // Role-specific profile updates
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
            manufacturerDetails: dto.manufacturerProfile
              ? { create: dto.manufacturerProfile }
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
              ? { update: dto.manufacturerProfile }
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
        where: { id: userId, deletedAt: null },
        data: updateData,
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
      where: { id: userId, deletedAt: null },
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
            manufacturerDetails: true,
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
      where: { id: userId, deletedAt: null },
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
            manufacturerDetails: true,
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
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('User not found');
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
            manufacturerDetails: true,
            brandDetails: true,
            retailerDetails: true,
          },
        },
      },
    });

    return this.mapUserToDTO(updatedUser);
  }

  async updateApplicationPreferencesService(
    userId: string,
    dto: PreferencesApplicationUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
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
            manufacturerDetails: true,
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
      where: { id: userId, deletedAt: null },
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
            removeImage(path.join(profileImagePath, user.profileImage));
          }
          updateData.profileImage = imageName;
        } else if (file.fieldname === 'bannerImage') {
          imagePath = path.join(bannerImagePath, imageName);
          if (user.bannerImage) {
            removeImage(path.join(bannerImagePath, user.bannerImage));
          }
          updateData.bannerImage = imageName;
        } else {
          throw new BadRequestException(
            `Invalid field name: ${file.fieldname}`,
          );
        }

        saveImage(file, imagePath);
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
            manufacturerDetails: true,
            brandDetails: true,
            retailerDetails: true,
          },
        },
      },
    });

    return this.mapUserToDTO(updatedUser);
  }
}
