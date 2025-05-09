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
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserUpdateCredentialDTO } from 'src/common/DTO/user/user.credential.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserUpdateDTO } from 'src/common/DTO/user/user.profile.Update.dto';
import { UserReadPrivateDTO } from 'src/common/DTO/user/user.private.Read.dto';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
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

  @Post('security/backup-codes/generate')
  @Roles('manufacturer', 'brand', 'retailer')
  async generateBackupCodes(@Request() req): Promise<UserReadPrivateDTO> {
    return await this.userService.generateBackupCodesService(req.user.id);
  }

  @Post('security/backup-codes/verify')
  @Roles('manufacturer', 'brand', 'retailer')
  async verifyBackupCodes(
    @Request() req,
    @Body() dto: { code: string },
  ): Promise<{ valid: boolean }> {
    return await this.userService.verifyBackupCodeService(
      req.user.id,
      dto.code,
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
    FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 },
      ],

      ImageOption,
    ),
  )
  async uploadImage(
    @Request() req,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      bannerImage?: Express.Multer.File[];
    },
  ): Promise<UserReadPrivateDTO> {
    const filesToProcess: Express.Multer.File[] = [];
    if (files.profileImage && files.profileImage[0]) {
      filesToProcess.push(files.profileImage[0]);
    }

    if (files.bannerImage && files.bannerImage[0]) {
      filesToProcess.push(files.bannerImage[0]);
    }

    return await this.userService.uploadImagesService(
      req.user.id,
      filesToProcess,
    );
  }

  @Delete('profile')
  @Roles('manufacturer', 'brand', 'retailer')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Request() req: any): Promise<void> {
    await this.userService.deleteUserService(req.user.id);
  }

  @Delete('admin-delete-user/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminDeleteUser(
    @Param('id', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    await this.userService.deleteUserService(userId);
  }
}
