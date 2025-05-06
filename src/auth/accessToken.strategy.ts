import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { Status, User } from 'generated/prisma';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from 'src/common/interface/payload.interface';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/users/users.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      console.error('JWT_SECRET is not set in environment variables.');
      throw new Error('JWT_SECRET environment variable not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: Payload): Promise<User> {
    if (!payload || !payload.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userService.findOneInternal(payload.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // TODO: in development
    // if (user.status !== Status.active) {
    //   throw new UnauthorizedException('User account is not active');
    // }

    return user;
  }
}
