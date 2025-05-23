import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  async validate(payload: any) {
    if (payload.role === 'admin') {
      // admin validation
      const admin = await this.prisma.admin.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          username: true,
        },
      });

      if (!admin) {
        throw new UnauthorizedException('Invalid admin credentials');
      }

      return { id: admin.id, username: admin.username, role: 'admin' };
    } else {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          accountStatus: true,
        },
      });

      if (!user || user.accountStatus !== 'active') {
        throw new UnauthorizedException('Invalid user or inactive account');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  }
}
