import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { User } from 'generated/prisma';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from 'src/common/interface/payload.interface';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
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
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.log('Error validating user from token payload', error);
      throw new BadRequestException('Invalid token or user data');
    }
  }
}
