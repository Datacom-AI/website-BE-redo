import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UserUpdateCredentialDTO } from 'src/common/DTO/user/user.credential.dto';
import { UserUpdateProfileDTO } from 'src/common/DTO/user/user.profile.Update.dto';
import { UserReadPrivateDTO } from 'src/common/DTO/user/user.private.Read.dto';
import { UserReadPublicDTO } from 'src/common/DTO/user/user.public.Read.dto';
import { GetUserProfile } from 'src/common/decorators/getUserProfile.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User, UserRole } from 'generated/prisma';
import { RoleGuard } from 'src/common/guards/role.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'), new RoleGuard([UserRole.manufacturer]))
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<UserReadPublicDTO[]> {
    return this.userService.findAllPublic();
  }

  @Get('find/:id')
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserReadPublicDTO> {
    const user = await this.userService.findOnePublic(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get('me')
  async getMyProfile(
    @GetUserProfile() user: User,
  ): Promise<UserReadPrivateDTO> {
    console.log('User ID:', user); // Debugging line
    const privateProfile = await this.userService.findPrivate(user);
    if (!privateProfile) {
      throw new NotFoundException('User profile data not found');
    }

    return privateProfile;
  }

  @Put('profile')
  async updateMyProfile(
    @GetUserProfile() user: User,
    @Body() profileData: UserUpdateProfileDTO,
  ): Promise<UserReadPrivateDTO | undefined> {
    return this.userService.updateProfile(user.id, profileData);
  }

  @Put('credentials')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMyCredentials(
    @GetUserProfile() user: User,
    @Body() credentialsData: UserUpdateCredentialDTO,
  ): Promise<void> {
    await this.userService.updateCredentials(user.id, credentialsData);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMyProfile(@GetUserProfile() user: User): Promise<void> {
    await this.userService.delete(user.id);
  }

  @Post(':id')
  async setActiveUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const updatedUser = await this.userService.setActive(id);

    return;
  }
}
