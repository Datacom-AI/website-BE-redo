import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';

import { Status, UserRole, User, PasswordResetToken } from 'generated/prisma';
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

@Injectable()
export class AuthService {
  constructor(
    private UserService: UserService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  // register user
  async registerService(registerPayload: AuthRegisterDTO): Promise<User> {
    // save the user password in encrypted format
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(registerPayload.password, salt);

    // map the payload to the user object
    const userDataForCreation = {
      name: registerPayload.name,
      email: registerPayload.email,
      password: hashedPassword,
      role: UserRole.manufacturer,
      status: Status.online,
    };

    // return the user object
    return this.UserService.createUser(userDataForCreation);
  }

  // login user
  async loginService(
    loginPayload: AuthLoginDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginPayload;
    const user = await this.UserService.findByEmail(email);
    const comparePassword: boolean = await bcryptjs.compare(
      password,
      user.password,
    );

    if (!comparePassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  // refresh token service
  refreshTokenService(user: User): { accessToken: string } {
    if (!user) {
      throw new BadRequestException('User is required to generate a new token');
    }

    const newAccessToken = this.generateAccessToken(user);
    return {
      accessToken: newAccessToken,
    };
  }

  /* ---- PASSWORD RESET METHODS ---- */
  async forgotPasswordService(
    forgotPasswordPayload: AuthForgotPasswordDTO,
  ): Promise<void> {
    const { email } = forgotPasswordPayload;

    let user: User | null = null;

    try {
      user = await this.UserService.findByEmail(email);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        console.error('Error finding user for password reset:', error);
      }
    }

    if (!user) {
      try {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // delete any existing tokens for the user
        await this.prisma.passwordResetToken.deleteMany({
          where: {
            // @ts-expect-error disable-next-line
            userId: user.id,
            expiresAt: { gt: new Date() },
            isUsed: false,
          },
        });

        await this.prisma.passwordResetToken.create({
          data: {
            token: resetToken,
            // @ts-expect-error disable-next-line
            userId: user.id,
            expiresAt: expiresAt,
            isUsed: false,
          },
        });

        const frontendBaseUrl =
          this.configService.get<string>('FRONTEND_BASE_URL');
        if (!frontendBaseUrl) {
          console.error(
            'FRONTEND_BASE_URL is not set in the environment variables. Cannot generate password reset link.',
          );
        }

        const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}`;

        await this.emailService.sendPasswordResetEmail(
          // @ts-expect-error disable-next-line
          user.email,
          // @ts-expect-error disable-next-line
          user.name || 'User',
          resetLink,
        );
      } catch (error) {
        console.error('Error creating password reset token:', error);
      }
    }

    return;
  }

  async resetPasswordService(
    resetPasswordPayload: AuthResetPasswordDTO,
  ): Promise<User> {
    const { token, newPassword } = resetPasswordPayload;

    type PasswordResetTokenWithUser = Prisma.PasswordResetTokenGetPayload<{
      include: { user: true };
    }>; // fixing type error

    let resetTokenRecord: PasswordResetTokenWithUser | null = null;
    try {
      resetTokenRecord = (await this.prisma.passwordResetToken.findUnique({
        where: { token: token },
        include: { user: true },
      })) as (PasswordResetToken & { user: User }) | null;
    } catch (error) {
      console.error('Error finding password reset token:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }

    const now = new Date();
    if (
      !resetTokenRecord ||
      resetTokenRecord.expiresAt < now ||
      resetTokenRecord.isUsed
    ) {
      if (
        resetTokenRecord &&
        resetTokenRecord.expiresAt < now &&
        !resetTokenRecord.isUsed
      ) {
        await this.prisma.passwordResetToken.update({
          where: { id: resetTokenRecord.id },
          data: { isUsed: true },
        });
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userToUpdate = resetTokenRecord.user;

    if (!userToUpdate) {
      console.error(
        `Password reset token ${resetTokenRecord.id} found, but linked user ${resetTokenRecord.userId} not found.`,
      );
      throw new NotFoundException(
        'Could not reset password due to internal error',
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    try {
      const updatedUser = await this.prisma.$transaction(async (txPrisma) => {
        const userUpdateResult = await txPrisma.user.update({
          where: { id: userToUpdate.id },
          data: {
            password: hashedPassword,
            updatedAt: new Date(),
          },
        });

        await this.prisma.passwordResetToken.update({
          where: { id: resetTokenRecord.id },
          data: { isUsed: true },
        });

        return userUpdateResult;
      });

      return this.UserService.findOne(updatedUser.id);
    } catch (error) {
      console.error('Error during password reset transaction:', error);
      throw new InternalServerErrorException(
        'Could not reset password due to internal error',
      );
    }
  }

  /* ---- PRIVATE METHODS ---- */

  // generate access token
  private generateAccessToken(user: User): string {
    if (!user) {
      throw new BadRequestException(
        'User is required to generate an access token',
      );
    }

    const payload: Payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '30s', // 30 seconds for testing purposes
      // expiresIn: '1h', // ≥15m for production
    });

    return accessToken;
  }

  // generate refresh token
  private generateRefreshToken(user: User): string {
    if (!user) {
      throw new BadRequestException(
        'User is required to generate a refresh token',
      );
    }

    const payload: Payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '1m', // 1 minute for testing purposes
      // expiresIn: '7d', // 7 days for production
    });

    return refreshToken;
  }
}
