import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from 'src/email/email.module';
import { ConfigService } from '@nestjs/config';
import { JwtAccessTokenStrategy } from './accessToken.strategy';
import { JwtRefreshTokenStrategy } from './refreshToken.strategy';
import { MappersModule } from 'src/common/mappers/mappers.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_REFRESH_SECRET'),
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    PassportModule,
    forwardRef(() => UsersModule),
    MappersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
