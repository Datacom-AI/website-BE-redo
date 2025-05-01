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
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  constructor(private authService: AuthService) {}

  // user register
  @Post('/register')
  async register(
    @Body()
    registerUserDTO: AuthRegisterDTO,
  ) {
    return await this.authService.registerService(registerUserDTO);
  }

  // user login
  @Post('/login')
  async login(
    @Body()
    authLoginUserDTO: AuthLoginDTO,
  ) {
    return await this.authService.loginService(authLoginUserDTO);
  }

  // user forgot password
  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK) // response code 200 even if email not found for security reasons
  async forgotPassword(
    @Body()
    forgotPasswordDTO: AuthForgotPasswordDTO,
  ): Promise<{ message: string }> {
    await this.authService.forgotPasswordService(forgotPasswordDTO);

    return {
      message:
        'If a user with that email exists, a password reset link has been sent.',
    };
  }

  // user reset password
  @Post('/reset-password')
  @HttpCode(HttpStatus.OK) // response code 200 even if token not found for security reasons
  async resetPassword(
    @Body()
    resetPasswordDTO: AuthResetPasswordDTO,
  ): Promise<{ message: string }> {
    const updatedUser =
      await this.authService.resetPasswordService(resetPasswordDTO);

    return {
      message: 'Password reset successfully.',
    };
  }
}
