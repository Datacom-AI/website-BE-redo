import * as fs from 'fs/promises';

import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const uploadPath =
          configService.get<string>('UPLOAD_PATH') || 'src/uploads';
        await fs.mkdir(uploadPath, { recursive: true });
        return { dest: uploadPath };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
