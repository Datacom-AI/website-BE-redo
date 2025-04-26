import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'generated/prisma';
import * as bcryptjs from 'bcryptjs';
import { CustomerRawDataDTO, UserRawDTO } from 'src/common/DTO/user.raw.dto';
import { CustomerUpdateDTO } from 'src/common/DTO/user.credential.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // get all users
  async findAll() {
    return this.prisma.user.findMany({});
  }

  // get user by id
  async findOne(id: string) {
    if (!id) {
      throw new Error('User ID is required');
    }
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
      throw new NotFoundException('User not found', {
        cause: error,
        description: 'Invalid',
      });
    }
  }

  // get user by email
  async findByEmail(email: string) {
    if (!email) {
      throw new Error('User email is required');
    }
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw new NotFoundException('User not found', {
        cause: error,
        description: 'Invalid',
      });
    }
  }

  // create user
  async createUser(userData: UserRawDTO): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: userData,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw new BadRequestException('Error creating user');
    }
  }

  // update user
  async updateUser(id: string, data: any) {
    const user = await this.findOne(id);
    try {
      return await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw new BadRequestException('Error updating user');
    }
  }

  // delete user
  async deleteUser(id: string) {
    const user = await this.findOne(id);
    try {
      return await this.prisma.user.delete({
        where: {
          id: user.id,
        },
      });
    } catch (error) {
      throw new BadRequestException('Error deleting user');
    }
  }

  // compare user data
  async compareUserData(user: User): Promise<boolean> {}
}
