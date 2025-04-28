import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './users.service';
import { User } from 'generated/prisma';
import { AuthGuard } from '@nestjs/passport';
import { GetUserProfile } from 'src/common/decorators/getUserProfile.decorator';
import { UserUpdateCredentialDTO } from 'src/common/DTO/user/user.credential.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  // get all users
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  // get user by id
  @Get('/find/:id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  // get user profile
  @Get('/profile')
  @UseGuards(AuthGuard('jwt'))
  async getUserProfile(@GetUserProfile() user: User): Promise<User> {
    return this.userService.findOne(user.id);
  }

  // update user profile
  @Put()
  @UseInterceptors(AuthGuard('jwt'))
  async updateUserProfile(
    @GetUserProfile() user: User,
    @Body() userUpdatePayload: UserUpdateCredentialDTO,
  ): Promise<User> {
    return this.userService.updateAccountService(user, userUpdatePayload);
  }

  // delete user profile by id
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async deleteUserProfile(@GetUserProfile() user: User): Promise<User> {
    return await this.userService.deleteAccountService(user);
  }
}
