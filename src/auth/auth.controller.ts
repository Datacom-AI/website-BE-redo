import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from 'src/common/DTO';
import { LoginUserDTO } from 'src/common/DTO/loginUserDTO';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // user register
  @Post('/register')
  async register(
    @Body()
    registerUserDTO: RegisterUserDTO,
  ) {
    return await this.authService.registerService(registerUserDTO);
  }

  // user login
  @Post('/login')
  async login(
    @Body()
    loginUserDTO: LoginUserDTO,
  ) {
    return await this.authService.loginService(loginUserDTO);
  }
}
