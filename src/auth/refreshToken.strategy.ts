// refresh Token strategy
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from 'src/common/interface/payload.interface';
import { PrismaService } from 'src/prisma.service';
import { User } from 'generated/prisma';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      ignoreExpiration: false, // default is false, just add it for clarity
    });
  }

  async validate(payload: Payload): Promise<User> {
    const { id } = payload;

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error validating user from refresh token payload:', error);

      throw new BadRequestException('Invalid refresh token or user data');
    }
  }
}
