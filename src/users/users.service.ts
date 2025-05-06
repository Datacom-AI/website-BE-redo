import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from 'src/prisma.service';

import { AuthRegisterDTO } from 'src/common/DTO/auth/auth.register.dto';
import { UserUpdateCredentialDTO } from 'src/common/DTO/user/user.credential.dto';
import { UserUpdateProfileDTO } from 'src/common/DTO/user/user.profile.Update.dto';
import { UserReadPrivateDTO } from 'src/common/DTO/user/user.private.Read.dto';
import { UserReadPublicDTO } from 'src/common/DTO/user/user.public.Read.dto';
import { UserReadMinimalDTO } from 'src/common/DTO/others/userMinimal.Read.dto';

import { UserMapperService } from 'src/common/mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private userMapper: UserMapperService,
  ) {}

  async setActive(userId: string): Promise<void> {
    if (!userId) {
      console.error('UserService: setActive received null or empty ID');
      return;
    }
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { status: 'active' },
      });
      return;
    } catch (error) {
      console.error('UserService: Error in setActive', error);
      throw new BadRequestException(
        `Invalid user ID format or database error for ID: ${userId}`,
      );
    }
  }

  async findAllInternal(): Promise<User[]> {
    return this.prisma.user.findMany({});
  }

  async findOneInternal(id: string): Promise<User | null> {
    if (!id) {
      console.error('UserService: findOneInternal received null or empty ID');
      return null;
    }
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      return user;
    } catch (error) {
      console.error('UserService: Error in findOneInternal', error);
      throw new BadRequestException(
        `Invalid user ID format or database error for ID: ${id}`,
      );
    }
  }

  async findByEmailInternal(email: string): Promise<User | null> {
    if (!email) {
      console.error(
        'UserService: findByEmailInternal received null or empty email',
      );
      return null;
    }
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      console.error('UserService: Error in findByEmailInternal', error);
      throw new BadRequestException(
        `Invalid email format or database error for email: ${email}`,
      );
    }
  }

  async createInternal(userData: Prisma.UserCreateInput): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: userData,
      });
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User with this email already exists');
      }
      console.error('UserService: Error creating user internal', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAllPublic(): Promise<UserReadPublicDTO[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        jobTitle: true,
        profileImageUrl: true,
        bannerImageUrl: true,
        professionalBio: true,
        isProfilePublic: true,
        createdAt: true,
        companyInfo: {
          select: {
            id: true,
            name: true,
            companyWebsite: true,
            addressCity: true,
            addressCountry: true,
          },
        },
        socialLinks: { select: { id: true, platform: true, url: true } },
        manufacturerProfile: {
          select: { id: true, isVerifiedManufacturer: true },
        },
        brandProfile: { select: { id: true } },
        retailerProfile: { select: { id: true } },
      },
    });

    return users
      .map((user) => this.userMapper.toUserReadPublicDTO(user))
      .filter((dto): dto is UserReadPublicDTO => dto !== null);
  }

  async findOnePublic(id: string): Promise<UserReadPublicDTO | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        jobTitle: true,
        profileImageUrl: true,
        bannerImageUrl: true,
        professionalBio: true,
        isProfilePublic: true,
        createdAt: true,
        companyInfo: {
          select: {
            id: true,
            name: true,
            companyWebsite: true,
            addressCity: true,
            addressCountry: true,
          },
        },
        socialLinks: { select: { id: true, platform: true, url: true } },
        manufacturerProfile: {
          select: { id: true, isVerifiedManufacturer: true },
        },
        brandProfile: { select: { id: true } },
        retailerProfile: { select: { id: true } },
      },
    });

    if (!user) return null;

    return this.userMapper.toUserReadPublicDTO(user);
  }

  async findPrivate(user: User): Promise<UserReadPrivateDTO> {
    if (!user || !user.id) {
      console.error(
        'UserService: findPrivate received null or incomplete user object',
      );

      return user;
    }

    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        lastLogin: true,
        jobTitle: true,
        profileImageUrl: true,
        bannerImageUrl: true,
        professionalBio: true,
        isProfilePublic: true,
        createdAt: true,
        updatedAt: true,
        socialLinks: {
          select: {
            id: true,
            platform: true,
            url: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        companyInfo: {
          select: {
            id: true,
            userId: true,
            name: true,
            companyEmail: true,
            phoneNumber: true,
            companyWebsite: true,
            establishedYear: true,
            industry: true,
            companySize: true,
            speciallization: true,
            companySubtitle: true,
            addressStreet: true,
            addressCity: true,
            addressState: true,
            addressZipCode: true,
            addressCountry: true,
            companyDescription: true,
            createdAt: true,
            updatedAt: true,
            tags: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        notificationPreferences: {
          select: {
            id: true,
            userId: true,
            emailNotifications: true,
            messageNotifications: true,
            matchNotifications: true,
            marketingEmails: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        securitySettings: {
          select: {
            id: true,
            userId: true,
            twoFactorAuthentication: true,
            twoFactorConfirmed: true,
            alertNewLogin: true,
            alertNewDeviceLogin: true,
            alertPasswordChanges: true,
            alertSuspiciousActivity: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        applicationPreferences: {
          select: {
            id: true,
            userId: true,
            language: true,
            theme: true,
            compactSidebarEnabled: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        manufacturerProfile: {
          select: {
            id: true,
            userId: true,
            isVerifiedManufacturer: true,
            showProductionCapacity: true,
            showCertifications: true,
            createdAt: true,
            updatedAt: true,
            manufacturingCapability: {
              select: {
                id: true,
                manufacturerProfileId: true,
                productionCapacity: true,
                minimumOrderValue: true,
                createdAt: true,
                updatedAt: true,
                materialsHandled: {
                  select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
                specialties: {
                  select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        },
        brandProfile: {
          select: {
            id: true,
            userId: true,
            growthRateYoY: true,
            marketPenetrationPercentage: true,
            marketSharePercentage: true,
            estimatedShopperReachK: true,
            totalRetailerSales: true,
            productFeatures: true,
            brandCertifications: true,
            sustainabilityClaims: true,
            totalSocialMediaFollowers: true,
            averageEngagementRate: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        retailerProfile: {
          select: {
            id: true,
            userId: true,
            businessType: true,
            storeFormat: true,
            averageStoreSize: true,
            customerBaseDescription: true,
            totalSkus: true,
            activeCustomerCount: true,
            averageMonthlySales: true,
            salesGrowthRateYoY: true,
            inventoryInStockPercentage: true,
            fulfillmentPercentage: true,
            topSellingCategoriesJson: true,
            customerDemographicsJson: true,
            purchaseFrequencyJson: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!fullUser) {
      throw new NotFoundException('User not found');
    }

    const manufacturerCounts = fullUser.ma
      ? await this.prisma.$transaction([
          this.prisma.catalogProduct.count({
            where: { manufacturerProfileId: fullUser.manufacturerProfile.id },
          }),
          this.prisma.inventoryItems.count({
            where: { manufacturerProfileId: fullUser.manufacturerProfile.id },
          }),
          this.prisma.certification.count({
            where: { manufacturerProfileId: fullUser.manufacturerProfile.id },
          }),
          this.prisma.productionLine.count({
            where: { manufacturerProfileId: fullUser.manufacturerProfile.id },
          }),
        ])
      : [0, 0, 0, 0];

    const brandCounts = fullUser.brandProfile
      ? await this.prisma.marketingCampaign.count({
          where: { brandProfileId: fullUser.brandProfile.id },
        })
      : 0;

    const retailerCounts = fullUser.retailerProfile
      ? await this.prisma.$transaction([
          this.prisma.storeLocation.count({
            where: { retailerProfileId: fullUser.retailerProfile.id },
          }),
          this.prisma.retailerProduct.count({
            where: { retailerProfileId: fullUser.retailerProfile.id },
          }),
        ])
      : [0, 0];

    return this.userMapper.toUserReadPrivateDTO(fullUser, {
      manufacturer: {
        productsCount: manufacturerCounts[0],
        inventoryItemsCount: manufacturerCounts[1],
        certificationCount: manufacturerCounts[2],
        productionLinesCount: manufacturerCounts[3],
      },
      brand: { marketingCampaignCount: brandCounts },
      retailer: {
        storeLocationCount: retailerCounts[0],
        retailerProductCount: retailerCounts[1],
      },
    });
  }

  async updateProfile(
    userId: string,
    profileData: UserUpdateProfileDTO,
  ): Promise<UserReadPrivateDTO | undefined> {
    try {
      const updateData: Prisma.UserUpdateInput = {};

      if (profileData.name !== undefined) updateData.name = profileData.name;
      if (profileData.jobTitle !== undefined)
        updateData.jobTitle = profileData.jobTitle;
      if (profileData.profileImageUrl !== undefined)
        updateData.profileImageUrl = profileData.profileImageUrl;
      if (profileData.bannerImageUrl !== undefined)
        updateData.bannerImageUrl = profileData.bannerImageUrl;
      if (profileData.professionalBio !== undefined)
        updateData.professionalBio = profileData.professionalBio;
      if (profileData.isProfilePublic !== undefined)
        updateData.isProfilePublic = profileData.isProfilePublic;
      if (profileData.status !== undefined)
        updateData.status = profileData.status;

      if (Object.keys(updateData).length === 0) {
        const currentUser = await this.findOneInternal(userId);
        if (!currentUser) throw new NotFoundException('User not found');
        const privateDTO = await this.findPrivate(currentUser);
        if (!privateDTO) {
          throw new InternalServerErrorException(
            'Failed to retrieve user profile',
          );
        }
        return privateDTO;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      const privateDTO = await this.findPrivate(updatedUser);
      if (!privateDTO) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated user profile',
        );
      }
      return privateDTO;
    } catch (error) {
      console.error('UserService: Error updating user profile', error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new InternalServerErrorException('Failed to update user profile');
      }
    }
  }

  async updateCredentials(
    userId: string,
    credentialsData: UserUpdateCredentialDTO,
  ): Promise<void> {
    const user = await this.findOneInternal(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (credentialsData.name !== undefined) {
      updateData.name = credentialsData.name;
    }
    if (
      credentialsData.email !== undefined &&
      credentialsData.email !== user.email
    ) {
      const existingUserWithEmail = await this.prisma.user.findUnique({
        where: { email: credentialsData.email },
      });
      if (existingUserWithEmail) {
        throw new ConflictException('Email address already in use');
      }
      updateData.email = credentialsData.email;
    }

    if (credentialsData.oldPassword !== undefined) {
      const isPasswordCorrect = await bcryptjs.compare(
        credentialsData.oldPassword,
        user.password,
      );
      if (!isPasswordCorrect) {
        throw new BadRequestException('Invalid old password');
      }

      if (
        !credentialsData.newPassword ||
        credentialsData.newPassword !== credentialsData.confirmPassword
      ) {
        throw new BadRequestException(
          'New password and confirmation do not match',
        );
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(
        credentialsData.newPassword,
        salt,
      );
      updateData.password = hashedPassword;
    } else {
      if (
        credentialsData.newPassword !== undefined ||
        credentialsData.confirmPassword !== undefined
      ) {
        throw new BadRequestException(
          'Old password must be provided to change password',
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      return;
    }

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    } catch (error) {
      console.error('UserService: Error updating user credentials', error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email address already in use');
      }
      throw new InternalServerErrorException(
        'Failed to update user credentials',
      );
    }
  }

  async delete(userId: string): Promise<void> {
    const user = await this.findOneInternal(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      console.error('UserService: Error deleting user', error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Cannot delete user because related records exist.',
        );
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async findMinimalInternal(id: string): Promise<UserReadMinimalDTO | null> {
    if (!id) return null;
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        profileImageUrl: true,
        companyInfo: {
          select: { id: true, name: true },
        },
      },
    });
    if (!user) return null;
    return this.userMapper.toUserReadMinimalDTO(user);
  }

  async findPublicInternal(id: string): Promise<UserReadPublicDTO | null> {
    return this.findOnePublic(id);
  }
}
