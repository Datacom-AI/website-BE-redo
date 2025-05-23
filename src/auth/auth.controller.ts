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
import { User } from 'generated/prisma';
import { AuthVerifyEmailDTO } from 'src/common/DTO/auth/auth.verifyEmail.dto';
import { UserReadMinimalDTO } from 'src/common/DTO/others/userMinimal.Read.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
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

  /* ADMIN CONTROLLERS */

  @Post('admin/register')
  @HttpCode(HttpStatus.OK)
  async adminRegister(
    @Body()
    body: {
      username: string;
      password: string;
      email?: string;
    },
  ): Promise<{
    id: string;
    username: string;
    email?: string;
  }> {
    return this.authService.adminRegisterService(body);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(
    @Body() body: { username: string; password: string },
  ): Promise<{ accessToken: string }> {
    return this.authService.adminLoginService(body.username, body.password);
  }

  /* END OF ADMIN CONTROLLERS */
}
