// refresh Token strategy
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from 'src/common/interface/payload.interface';
import { PrismaService } from 'src/prisma.service';
import { User } from 'generated/prisma';
import { BadRequestException } from '@nestjs/common/exceptions';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
    });
  }

  async validate(payload: Payload): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      return user;
    } catch (error) {
      throw new BadRequestException('User not found', {
        cause: error,
        description: 'Invalid',
      });
    }
  }
}
