import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDTO } from '../common/DTO/createUserDTO';

@Controller('users')
export class UsersController {
  @Post('/register')
  create(
    @Body()
    createUserDTO: CreateUserDTO,
  ) {
    return createUserDTO;
  }
}
