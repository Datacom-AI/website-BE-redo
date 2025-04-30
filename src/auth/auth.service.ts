import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

import { Status, UserRole, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

import { AuthRegisterUserDTO } from 'src/common/DTO';
import { AuthLoginUserDTO } from 'src/common/DTO/auth/auth.loginUser.dto';
import { RegisterResponse } from 'src/common/interface/auth.interface';
import { UserService } from 'src/users/users.service';
import { Payload } from 'src/common/interface/payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private UserService: UserService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // register user
  async registerService(
    registerPayload: AuthRegisterUserDTO,
  ): Promise<RegisterResponse> {
    // save the user password in encrypted format
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(registerPayload.password, salt);

    // map the payload to the user object
    const userData = {
      ...registerPayload,
      role: registerPayload.role as unknown as UserRole,
      password: hashedPassword,
    };

    // return the user object
    return this.UserService.createUser({
      ...userData,
    });
  }

  // login user
  async loginService(
    loginPayload: AuthLoginUserDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginPayload;
    const user = await this.UserService.findByEmail(email);
    const comparePassword: boolean = await bcryptjs.compare(
      password,
      user.password,
    );

    if (!comparePassword) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user) {
      throw new BadRequestException('User with given email not found');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  // refresh token service
  refreshTokenService(user: User): { accessToken: string } {
    if (!user) {
      throw new BadRequestException('User is required to generate a new token');
    }

    const newAccessToken = this.generateAccessToken(user);
    return {
      accessToken: newAccessToken,
    };
  }

  /* ---- PRIVATE METHODS ---- */

  // generate access token
  private generateAccessToken(user: User): string {
    if (!user) {
      throw new BadRequestException(
        'User is required to generate an access token',
      );
    }

    const payload: Payload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '30s',
    });

    return accessToken;
  }

  // generate refresh token
  private generateRefreshToken(user: User): string {
    if (!user) {
      throw new BadRequestException(
        'User is required to generate a refresh token',
      );
    }

    const payload: Payload = {
      id: user.id,
      email: user.email,
    };

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '1m',
    });

    return refreshToken;
  }
}
