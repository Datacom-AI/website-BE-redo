import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterUserDTO } from 'src/common/DTO';
import { AuthLoginUserDTO } from 'src/common/DTO/auth/auth.loginUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // user register
  @Post('/register')
  async register(
    @Body()
    registerUserDTO: AuthRegisterUserDTO,
  ) {
    return await this.authService.registerService(registerUserDTO);
  }

  // user login
  @Post('/login')
  async login(
    @Body()
    authLoginUserDTO: AuthLoginUserDTO,
  ) {
    return await this.authService.loginService(authLoginUserDTO);
  }
}
