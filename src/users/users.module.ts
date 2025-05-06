import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { PrismaService } from 'src/prisma.service'; // Assuming path
import { AuthModule } from 'src/auth/auth.module'; // Assuming path
import { PassportModule } from '@nestjs/passport';
import { MappersModule } from 'src/common/mappers/mappers.module'; // <--- Import MappersModule

@Module({
  controllers: [UsersController],
  providers: [UserService, PrismaService], // PrismaService should ideally be in a core/shared module
  imports: [
    forwardRef(() => AuthModule), // Handle circular dependency
    PassportModule.register({ defaultStrategy: 'jwt' }), // Configure PassportModule
    MappersModule, // <--- Import MappersModule
  ],
  // Export UserService for use in other modules (like Auth)
  // Export MappersModule if other modules need to use mappers directly (less common)
  exports: [UserService], // Export UserService
})
export class UsersModule {}
