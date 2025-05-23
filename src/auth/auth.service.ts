import * as bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { AuthRegisterDTO } from 'src/common/DTO/auth/auth.register.dto';
import { User } from 'generated/prisma';
import { AuthVerifyEmailDTO } from 'src/common/DTO/auth/auth.verifyEmail.dto';
import { AuthLoginDTO } from 'src/common/DTO/auth/auth.login.dto';
import { Payload } from 'src/common/interface';
import { AuthForgotPasswordDTO } from 'src/common/DTO/auth/auth.forgotPassword.dto';
import { AuthResetPasswordDTO } from 'src/common/DTO/auth/auth.resetPassword.dto';
import { UserReadMinimalDTO } from 'src/common/DTO/others/userMinimal.Read.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async registerService(dto: AuthRegisterDTO): Promise<User> {
    const { name, email, password, confirmPassword } = dto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with email or username already exists',
      );
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const user = await this.userService.createUserService({
      name,
      email,
      password,
      role: dto.role,
    });

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: verificationCode,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      template: 'verification',
      context: { name, code: verificationCode },
    });

    this.logger.log(`Verification code sent to ${email}: ${verificationCode}`);

    return user;
  }

  async verifyEmailService(dto: AuthVerifyEmailDTO): Promise<User> {
    const { email, token } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.accountStatus !== 'pendingVerification') {
      throw new BadRequestException('Invalid user or already verified');
    }

    const verificationCode = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token: token,
        expiresAt: { gte: new Date() },
        isUsed: false,
      },
    });

    if (!verificationCode) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.prisma.passwordResetToken.update({
      where: { id: verificationCode.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        presenceStatus: 'online',
        accountStatus: 'active',
      },
    });

    this.logger.log(`Email verified for user: ${email}. Status set to active`);

    return updatedUser;
  }

  async resendVerificationService(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.accountStatus !== 'pendingVerification') {
      throw new BadRequestException('User not found or already verified');
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: verificationCode,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      template: 'verification',
      context: { name: user.name, code: verificationCode },
    });
  }

  async loginService(dto: AuthLoginDTO): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserReadMinimalDTO;
  }> {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials or inactive account');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    if (user.accountStatus === 'pendingVerification') {
      throw new BadRequestException(
        'Please verify your email address to login',
      );
    } else if (user.accountStatus === 'active') {
      this.logger.log(`User ${user.email} logged in successfully`);
    } else {
      throw new BadRequestException(
        `Account status ${user.accountStatus} does not permit login. Please contact support.`,
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      } as UserReadMinimalDTO,
    };
  }

  /*
    ADMIN SERVICES
  */
  async adminRegisterService(adminData: {
    username: string;
    password: string;
    email?: string;
  }): Promise<{
    id: string;
    username: string;
    email?: string;
  }> {
    try {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(adminData.password, salt);

      const admin = await this.prisma.admin.create({
        data: {
          username: adminData.username,
          password: hashedPassword,
          email: adminData.email,
        },
      });

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email || undefined,
      };
    } catch (error) {
      this.logger.error('Admin registration failed:', error);
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Admin with this username already exists',
        );
      }

      throw new BadRequestException('Admin registration failed');
    }
  }

  async adminLoginService(
    username: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new BadRequestException('Invalid username or password');
    }

    const isPasswordValid = await bcryptjs.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid username or password');
    }

    const payload = {
      id: admin.id,
      username: admin.username,
      role: 'admin' as const,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    return { accessToken };
  }

  /* END OF ADMIN SERVICES */

  async refreshTokenService(
    refreshToken: string,
  ): Promise<{ newAccessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user || user.accountStatus !== 'active') {
        throw new UnauthorizedException('Invalid user or inactive account');
      }

      const newAccessToken = this.generateAccessToken(user);

      return { newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPasswordService(dto: AuthForgotPasswordDTO): Promise<User> {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException(
        'If a user with that email exists, a password reset link has been sent.',
      );
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hours

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: 'reset-password',
      context: {
        name: user.name,
        resetUrl,
      },
    });

    return user;
  }

  async resendPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: 'reset-password',
      context: {
        name: user.name,
        resetUrl,
      },
    });

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPasswordService(dto: AuthResetPasswordDTO): Promise<void> {
    const { token, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: { token, expiresAt: { gte: new Date() }, isUsed: false },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { isUsed: true, usedAt: new Date() },
      }),
    ]);

    return;
  }

  /*
    PRIVATE METHODS
  */
  private generateAccessToken(user: User): string {
    try {
      if (!user) {
        throw new BadRequestException('User is required to generate a token');
      }

      const payload: Payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      });

      return accessToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private generateRefreshToken(user: User): string {
    try {
      if (!user) {
        throw new BadRequestException('User is required to generate a token');
      }

      const payload: Payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      });

      return refreshToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
