import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from 'src/common/DTO';
import { RegisterResponse } from 'src/common/interface/user.interface';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from 'src/prisma.service';
import { UserRole } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async register(payload: CreateUserDTO): Promise<RegisterResponse> {
    // save the user password in encrypted format
    const hashedPassword = await this.hashPassword(payload.password, 10);
    // map the payload to the user object
    const userData = {
      ...payload,
      role: payload.role as unknown as UserRole,
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

  // Hash the password
  async hashPassword(plainText, saltRounds) {
    return await bcryptjs.hash(plainText, saltRounds);
  }
}
