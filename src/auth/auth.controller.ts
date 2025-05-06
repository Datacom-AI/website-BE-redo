import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDTO } from 'src/common/DTO/auth/auth.register.dto';
import { AuthLoginDTO } from 'src/common/DTO/auth/auth.login.dto';
import { AuthForgotPasswordDTO } from 'src/common/DTO/auth/auth.forgotPassword.dto';
import { AuthResetPasswordDTO } from 'src/common/DTO/auth/auth.resetPassword.dto';
import { UserReadPrivateDTO } from 'src/common/DTO/user/user.private.Read.dto';

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

  @Post('/register')
  async register(@Body() registerUserDTO: AuthRegisterDTO): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserReadPrivateDTO;
  }> {
    return await this.authService.registerService(registerUserDTO);
  }

  @Post('/login')
  async login(@Body() authLoginUserDTO: AuthLoginDTO): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserReadPrivateDTO;
  }> {
    return await this.authService.loginService(authLoginUserDTO);
  }

  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDTO: AuthForgotPasswordDTO,
  ): Promise<{ message: string }> {
    await this.authService.forgotPasswordService(forgotPasswordDTO);

    return {
      message:
        'If a user with that email exists, a password reset link has been sent.',
    };
  }

  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDTO: AuthResetPasswordDTO,
  ): Promise<{ message: string }> {
    await this.authService.resetPasswordService(resetPasswordDTO);

    return {
      message: 'Password reset successfully.',
    };
  }
}
