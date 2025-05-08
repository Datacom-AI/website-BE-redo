import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDTO } from 'src/common/DTO/auth/auth.register.dto';
import { AuthLoginDTO } from 'src/common/DTO/auth/auth.login.dto';
import { AuthForgotPasswordDTO } from 'src/common/DTO/auth/auth.forgotPassword.dto';
import { AuthResetPasswordDTO } from 'src/common/DTO/auth/auth.resetPassword.dto';
import { UserReadPrivateDTO } from 'src/common/DTO/user/user.private.Read.dto';
import { User } from 'generated/prisma';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { AuthVerifyEmailDTO } from 'src/common/DTO/auth/auth.verifyEmail.dto';
import { AuthChooseRoleDTO } from 'src/common/DTO/auth/auth.chooseRole.dto';
import { UserReadMinimalDTO } from 'src/common/DTO/others/userMinimal.Read.dto';

@Controller('auth')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: AuthRegisterDTO): Promise<User> {
    return await this.authService.registerService(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: AuthVerifyEmailDTO): Promise<User> {
    return await this.authService.verifyEmailService(dto);
  }

  @Post('choose-role')
  @HttpCode(HttpStatus.OK)
  async chooseRole(@Body() dto: AuthChooseRoleDTO): Promise<User> {
    return await this.authService.chooseRoleService(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthLoginDTO): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserReadMinimalDTO;
  }> {
    return await this.authService.loginService(dto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ newAccessToken: string }> {
    return this.authService.refreshTokenService(refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: AuthForgotPasswordDTO,
  ): Promise<{ message: string }> {
    await this.authService.forgotPasswordService(dto);

    return {
      message:
        'If a user with that email exists, a password reset link has been sent.',
    };
  }

  @Post('resend-password-reset')
  @HttpCode(HttpStatus.OK)
  async resendPasswordReset(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    return await this.authService.resendPasswordReset(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: AuthResetPasswordDTO,
  ): Promise<{ message: string }> {
    await this.authService.resetPasswordService(dto);

    return {
      message: 'Password reset successfully.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
