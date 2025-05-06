import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module'; // Import UsersModule
import { PrismaService } from 'src/prisma.service'; // Assuming PrismaService location
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from 'src/email/email.module'; // Assuming EmailModule exists
import { ConfigService } from '@nestjs/config';
import { JwtAccessTokenStrategy } from './accessToken.strategy';
import { JwtRefreshTokenStrategy } from './refreshToken.strategy'; // Assuming refresh token strategy exists
import { MappersModule } from 'src/common/mappers/mappers.module'; // <--- Add MappersModule import

@Module({
  imports: [
    // Configure JwtModule for Access Token
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        // expiresIn configured in service generation logic, not here for flexibility
        // signOptions: { expiresIn: '60s' }, // Remove fixed expiry here
      }),
      inject: [ConfigService],
      // Need to export JwtService if used by other modules
      // (e.g. JwtAccessTokenStrategy uses it implicitly via super, but if others directly inject JwtService)
    }),
    // Configure JwtModule for Refresh Token (if using separate secrets/config)
    // If using the same JwtService instance but with different signing options for refresh,
    // you might configure it differently or just use sign options directly in service.
    JwtModule.registerAsync({
      // Keep if separate secret is needed in module config
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_REFRESH_SECRET'),
        // expiresIn configured in service generation logic
        // signOptions: { expiresIn: '7d' }, // Remove fixed expiry here
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    PassportModule, // Imports authentication strategies implicitly
    forwardRef(() => UsersModule), // UsersModule needs AuthModule for AuthGuard, AuthModule needs UserService
    MappersModule, // <--- Import MappersModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService, // PrismaService should ideally be in a core/shared module and imported/exported
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy, // Provider for refresh token strategy
    // ConfigService is provided by ConfigModule, just need to inject it
    // EmailService is provided by EmailModule, just need to inject it
    // JwtService is provided by JwtModule, just need to inject it
  ],
  // Export AuthService if other modules need to use its methods
  // Export JwtModule if other modules directly inject JwtService (less common)
  exports: [AuthService], // Export AuthService
})
export class AuthModule {}
