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
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserUpdateCredentialDTO } from 'src/common/DTO/user/user.credential.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserUpdateDTO } from 'src/common/DTO/user/user.profile.Update.dto';
import { UserReadPrivateDTO } from 'src/common/DTO/user/user.private.Read.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageOption } from 'src/common/interceptor/image.interceptor';
import { PreferencesNotificationUpdateDTO } from 'src/common/DTO/preferences/preferences.notification.Update.dto';
import { SecuritySettingsUpdateDTO } from 'src/common/DTO/securitySettings/securitySettings.Update.dto';
import { PreferencesApplicationUpdateDTO } from 'src/common/DTO/preferences/preferences.application.Update.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('user')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('all')
  @Roles('admin')
  async findAll(): Promise<UserReadPrivateDTO[]> {
    return await this.userService.findAllService();
  }

  @Get('profile')
  @Roles('manufacturer', 'brand', 'retailer')
  async getProfile(@Request() req): Promise<UserReadPrivateDTO> {
    return await this.userService.getProfile(req.user.id);
  }

  @Patch('profile')
  @Roles('manufacturer', 'brand', 'retailer')
  async updateProfile(
    @Request() req,
    @Body() dto: UserUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    return await this.userService.updateProfileService(
      req.user.id,
      req.user.role,
      dto,
    );
  }

  @Patch('password')
  @Roles('manufacturer', 'brand', 'retailer')
  async updatePassword(
    @Request() req,
    @Body() dto: UserUpdateCredentialDTO,
  ): Promise<UserReadPrivateDTO> {
    return await this.userService.updatePasswordService(req.user.id, dto);
  }

  @Patch('preferences/notifications')
  @Roles('manufacturer', 'brand', 'retailer')
  async updateNotificationPreferences(
    @Request() req,
    @Body() dto: PreferencesNotificationUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    return await this.userService.updateNotificationPreferencesService(
      req.user.id,
      dto,
    );
  }

  @Patch('security')
  @Roles('manufacturer', 'brand', 'retailer')
  async updateSecuritySettings(
    @Request() req,
    @Body() dto: SecuritySettingsUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    return await this.userService.updateSecuritySettingsService(
      req.user.id,
      dto,
    );
  }

  @Patch('preferences/application')
  @Roles('manufacturer', 'brand', 'retailer')
  async updateApplicationPreferences(
    @Request() req,
    @Body() dto: PreferencesApplicationUpdateDTO,
  ): Promise<UserReadPrivateDTO> {
    return await this.userService.updateApplicationPreferencesService(
      req.user.id,
      dto,
    );
  }

  @Post('upload-image')
  @Roles('manufacturer', 'brand', 'retailer')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profileImage: { type: 'string', format: 'binary' },
        bannerImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      ...ImageOption,
      fileFilter: (req, file, callback) => {
        if (!['profileImage', 'bannerImage'].includes(file.fieldname)) {
          return callback(
            new BadRequestException(
              'Invalid field name. Use profileImage or bannerImage',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UserReadPrivateDTO> {
    return await this.userService.uploadImagesService(req.user.id, files);
  }

  @Delete('profile')
  @Roles('manufacturer', 'brand', 'retailer')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Request() req: any): Promise<void> {
    await this.userService.deleteUserService(req.user.id);
  }
}
