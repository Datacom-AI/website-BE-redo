import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { UserUpdateDTO } from 'src/common/DTO/user/user.profile.Update.dto';
import { UserReadPrivateDTO } from 'src/common/dto/user/user.private.Read.dto';
import { User, UserRole } from 'generated/prisma';
import {
  createImageName,
  saveImage,
  removeImage,
} from 'src/common/utils/image.utils';
import * as path from 'node:path';
import * as bcrypt from 'bcrypt';

export interface UserPasswordUpdateDTO {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private getUploadPath(): string {
    return this.configService.get<string>('UPLOAD_PATH') || './uploads';
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  private mapUserToDTO(user: User & any): UserReadPrivateDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.accountStatus,
      jobTitle: user.jobTitle,
      profileImageUrl: user.profileImage,
      bannerImageUrl: user.bannerImage,
      professionalBio: user.professionalBio,
      lastLogin: user.lastLogin,
      companyInfo: user.companyInfo,
      notificationPreferences: user.notificationPreferences,
      securitySettings: user.securitySettings,
      applicationPreferences: user.applicationPreferences,
      socialLinks: user.socialLinks,
      manufacturerProfile: user.profile?.manufacturerDetails,
      brandProfile: user.profile?.brandDetails,
      retailerProfile: user.profile?.retailerDetails,
      isProfilePublic: user.isProfilePublic,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // CRUD Methods

  async findAll(): Promise<UserReadPrivateDTO[]> {
    const users = await this.prisma.user.findMany({
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

  async findOne(id: string): Promise<UserReadPrivateDTO> {
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

  async findByEmail(email: string): Promise<UserReadPrivateDTO> {
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

  async create(userData: {
    email: string;
    name: string;
    password: string;
    role: UserRole;
  }): Promise<UserReadPrivateDTO> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          accountStatus: 'pending',
          presenceStatus: 'offline',
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

  async deleteUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const uploadPath = this.getUploadPath();
    if (user.profileImage) {
      removeImage(path.join(uploadPath, user.profileImage));
    }
    if (user.bannerImage) {
      removeImage(path.join(uploadPath, user.bannerImage));
    }

    await this.prisma.user.delete({ where: { id } });
  }

  // Profile Management

  async getProfile(userId: string): Promise<UserReadPrivateDTO> {
    return await this.findOne(userId);
  }

  async updateProfile(
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
            manufacturerDetails: true,
            brandDetails: true,
            retailerDetails: true,
          },
        },
      },
    });

    return this.mapUserToDTO(user);
  }

  async updatePassword(
    userId: string,
    dto: UserPasswordUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!dto.oldPassword || !dto.newPassword || !dto.confirmPassword) {
      throw new BadRequestException('All password fields are required');
    }

    const isOldPasswordValid = await bcrypt.compare(
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

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

  async uploadImages(
    userId: string,
    files: Express.Multer.File[],
  ): Promise<UserReadPrivateDTO> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const uploadPath = this.getUploadPath();
    const updateData: any = {};

    for (const file of files) {
      const imageName = createImageName(file);
      const imagePath = path.join(uploadPath, imageName);
      saveImage(file, imagePath);

      if (file.fieldname === 'profileImage') {
        if (user.profileImage) {
          removeImage(path.join(uploadPath, user.profileImage));
        }
        updateData.profileImage = imageName;
      } else if (file.fieldname === 'bannerImage') {
        if (user.bannerImage) {
          removeImage(path.join(uploadPath, user.bannerImage));
        }
        updateData.bannerImage = imageName;
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
