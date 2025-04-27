import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UsersController],
  providers: [UserService, PrismaService],
  imports: [forwardRef(() => AuthModule)],
  exports: [UserService],
})
export class UsersModule {}
