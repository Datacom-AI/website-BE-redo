import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';

import {
  UserRole,
  User,
  PasswordResetToken,
  PresenceStatus,
  AccountStatus,
} from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'generated/prisma';

import { AuthRegisterDTO } from 'src/common/DTO/auth/auth.register.dto';
import { AuthLoginDTO } from 'src/common/DTO/auth/auth.login.dto';
import { AuthForgotPasswordDTO } from 'src/common/DTO/auth/auth.forgotPassword.dto';
import { AuthResetPasswordDTO } from 'src/common/DTO/auth/auth.resetPassword.dto';
import { UserService } from 'src/users/users.service';
import { Payload } from 'src/common/interface/payload.interface';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { UserReadPrivateDTO } from 'src/common/DTO/user/user.private.Read.dto';
import { UserMapperService } from 'src/common/mappers/user.mapper';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    private userMapper: UserMapperService,
  ) {}

  async registerService(registerPayload: AuthRegisterDTO): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserReadPrivateDTO;
  }> {
    const userExists = await this.userService.findByEmailInternal(
      registerPayload.email,
    );
    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(registerPayload.password, salt);

    let user: User;
    try {
      user = await this.prisma.user.create({
        data: {
          name: registerPayload.name,
          email: registerPayload.email,
          password: hashedPassword,
          role: UserRole.manufacturer,
          accountStatus: AccountStatus.pending,
          presenceStatus: PresenceStatus.online,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          presenceStatus: true,
          jobTitle: true,
          lastLogin: true,
          profileImage: true,
          password: true,
          bannerImage: true,
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
              connectionNotifications: true,
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
          profile: {
            select: {
              id: true,
              userId: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
              manufacturerDetails: {
                select: {
                  id: true,
                  profileId: true,
                  isVerifiedManufacturer: true,
                  showProductionCapacity: true,
                  showCertifications: true,
                  createdAt: true,
                  updatedAt: true,
                  manufacturingCapability: {
                    select: {
                      id: true,
                      manufacturerDetailsId: true,
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
          },
        },
      });

      await this.prisma.$transaction(async (txPrisma) => {
        await txPrisma.notificationPreferences.create({
          data: { userId: user.id },
        });
        await txPrisma.securitySettings.create({ data: { userId: user.id } });
        await txPrisma.applicationPreferences.create({
          data: { userId: user.id },
        });
      });

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      const userReadDTO = this.userMapper.toUserReadPrivateDTO(user, {
        manufacturer: {},
        brand: {},
        retailer: {},
      });

      if (!userReadDTO) {
        console.error('AuthService: Failed to map user to DTO');
        throw new InternalServerErrorException('Failed to register user');
      }

      return { accessToken, refreshToken, user: userReadDTO };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User with this email already exists');
      }
      console.error('AuthService: Error during registration', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async loginService(loginPayload: AuthLoginDTO): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserReadPrivateDTO;
  }> {
    const { email, password } = loginPayload;

    const user = await this.userService.findByEmailInternal(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordCorrect: boolean = await bcryptjs.compare(
      password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    } catch (updateError) {
      console.error(
        'AuthService: Failed to update lastLogin for user',
        user.id,
        updateError,
      );
    }

    const userReadDTO = await this.userService.findPrivate(user);

    if (!userReadDTO) {
      console.error('AuthService: Failed to map user to DTO');
      throw new InternalServerErrorException('Failed to login user');
    }

    return {
      accessToken,
      refreshToken,
      user: userReadDTO,
    };
  }

  refreshTokenService(user: User): { accessToken: string } {
    if (!user || !user.id) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.generateAccessToken(user);
    return {
      accessToken: newAccessToken,
    };
  }

  async forgotPasswordService(
    forgotPasswordPayload: AuthForgotPasswordDTO,
  ): Promise<void> {
    const { email } = forgotPasswordPayload;

    let user: User | null = null;
    try {
      user = await this.userService.findByEmailInternal(email);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        console.error('Error finding user for password reset:', error);
      }
    }

    if (user) {
      try {
        const resetTokenPlain = crypto.randomBytes(32).toString('hex');
        const resetTokenHashed = crypto
          .createHash('sha256')
          .update(resetTokenPlain)
          .digest('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await this.prisma.$transaction(async (txPrisma) => {
          await txPrisma.passwordResetToken.updateMany({
            where: {
              userId: user.id,
              expiresAt: { gt: new Date() },
              isUsed: false,
            },
            data: { isUsed: true },
          });

          await txPrisma.passwordResetToken.create({
            data: {
              token: resetTokenHashed,
              userId: user.id,
              expiresAt: expiresAt,
              isUsed: false,
            },
          });
        });

        const frontendBaseUrl =
          this.configService.get<string>('FRONTEND_BASE_URL');
        if (!frontendBaseUrl) {
          console.error(
            'FRONTEND_BASE_URL is not set. Cannot generate password reset link.',
          );
        } else {
          const resetLink = `${frontendBaseUrl}/reset-password?token=${resetTokenPlain}`;

          await this.emailService.sendPasswordResetEmail(
            user.email,
            user.name || 'User',
            resetLink,
          );
          console.log(`Password reset email attempt sent to ${user.email}`);
        }
      } catch (error) {
        console.error(
          'AuthService: Error during password reset process for user',
          user.id,
          error,
        );
      }
    }

    return;
  }

  async resetPasswordService(
    resetPasswordPayload: AuthResetPasswordDTO,
  ): Promise<void> {
    const { token, newPassword } = resetPasswordPayload;

    const incomingTokenHashed = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    let resetTokenRecord: PasswordResetToken | null = null;
    try {
      resetTokenRecord = await this.prisma.passwordResetToken.findUnique({
        where: { token: incomingTokenHashed },
        include: { user: true },
      });
    } catch (error) {
      console.error(
        'AuthService: Error finding password reset token record',
        error,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }

    const now = new Date();
    if (
      !resetTokenRecord ||
      resetTokenRecord.expiresAt < now ||
      resetTokenRecord.isUsed
    ) {
      if (resetTokenRecord && !resetTokenRecord.isUsed) {
        try {
          await this.prisma.passwordResetToken.update({
            where: { id: resetTokenRecord.id },
            data: { isUsed: true },
          });
        } catch (updateError) {
          console.error(
            'AuthService: Failed to mark expired/used token as used',
            resetTokenRecord.id,
            updateError,
          );
        }
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userToUpdate = resetTokenRecord.userId;

    if (!userToUpdate) {
      console.error(
        `AuthService: Password reset token ${resetTokenRecord.id} found, but linked user ${resetTokenRecord.userId} not found.`,
      );
      throw new InternalServerErrorException(
        'Could not reset password due to internal error',
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    try {
      await this.prisma.$transaction(async (txPrisma) => {
        await txPrisma.user.update({
          where: { id: userToUpdate },
          data: {
            password: hashedPassword,
          },
        });

        await txPrisma.passwordResetToken.update({
          where: { id: resetTokenRecord.id },
          data: { isUsed: true },
        });
      });
    } catch (error) {
      console.error(
        'AuthService: Error during password reset transaction:',
        error,
      );
      throw new InternalServerErrorException(
        'Could not reset password due to internal error',
      );
    }

    return;
  }

  private generateAccessToken(user: User): string {
    if (!user || !user.id || !user.email || user.role === undefined) {
      console.error(
        'AuthService: Cannot generate access token, user data incomplete',
        user,
      );
      throw new InternalServerErrorException('Failed to generate access token');
    }

    const payload: Payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      console.error('JWT_SECRET is not set in environment variables.');
      throw new InternalServerErrorException('JWT secret not configured');
    }
    const expiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRY') || '1h';

    const accessToken = this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: expiresIn,
    });

    return accessToken;
  }

  private generateRefreshToken(user: User): string {
    if (!user || !user.id || !user.email || user.role === undefined) {
      console.error(
        'AuthService: Cannot generate refresh token, user data incomplete',
        user,
      );
      throw new InternalServerErrorException(
        'Failed to generate refresh token',
      );
    }

    const payload: Payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      console.error('JWT_REFRESH_SECRET is not set in environment variables.');
      throw new InternalServerErrorException(
        'JWT refresh secret not configured',
      );
    }
    const expiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d';

    const refreshToken = this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: expiresIn,
    });

    return refreshToken;
  }
}
