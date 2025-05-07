import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService, UserPasswordUpdateDTO } from './user.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserUpdateDTO } from 'src/common/dto/user/user.update.dto';
import { UserReadPrivateDTO } from 'src/common/dto/user/user.private.Read.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageOption } from 'src/common/utils/image.interceptor';

@Controller('user')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/all')
  @Roles('admin') // Assuming an admin role for managing users
  async findAll(): Promise<UserReadPrivateDTO[]> {
    return await this.userService.findAll();
  }

  @Get('/profile')
  @Roles('manufacturer', 'brand', 'retailer')
  async getProfile(@Request() req): Promise<UserReadPrivateDTO> {
    return await this.userService.getProfile(req.user.id);
  }

  @Patch('/profile')
  @Roles('manufacturer', 'brand', 'retailer')
  async updateProfile(
    @Request() req,
    @Body() dto: UserUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    return await this.userService.updateProfile(
      req.user.id,
      req.user.role,
      dto,
    );
  }

  @Patch('/password')
  @Roles('manufacturer', 'brand', 'retailer')
  async updatePassword(
    @Request() req,
    @Body() dto: UserPasswordUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    return await this.userService.updatePassword(req.user.id, dto);
  }

  @Post('/upload-image')
  @Roles('manufacturer', 'brand', 'retailer')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('images', 2, ImageOption))
  async uploadImage(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UserReadPrivateDTO> {
    return await this.userService.uploadImages(req.user.id, files);
  }

  @Delete('/profile')
  @Roles('manufacturer', 'brand', 'retailer')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Request() req): Promise<void> {
    await this.userService.deleteUser(req.user.id);
  }
}
