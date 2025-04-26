import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

import { Status, UserRole } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

import { RegisterUserDTO } from 'src/common/DTO';
import { LoginUserDTO } from 'src/common/DTO/loginUserDTO';
import { RegisterResponse } from 'src/common/interface/auth.interface';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private UserService: UserService) {}
  async registerService(payload: RegisterUserDTO): Promise<RegisterResponse> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: payload.email }, { username: payload.username }],
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'User created with the email/username you provided',
        {
          cause: new Error('User already exists'),
          description: 'User already exists',
        },
      );
    }

    // save the user password in encrypted format
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(payload.password, salt);

    // map the payload to the user object
    const userData = {
      ...payload,
      role: payload.role as unknown as UserRole,
      status: payload.status as unknown as Status,
      password: hashedPassword,
    };

    // return the user object
    return await this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        companyName: true,
        status: true,
      },
    });
  }

  // login user
  async loginService(loginUserDTO: LoginUserDTO) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginUserDTO.email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }
  }
}
