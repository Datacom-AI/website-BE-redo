import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'generated/prisma';
import * as bcryptjs from 'bcryptjs';
import { UserRawDTO } from 'src/common/DTO/user.raw.dto';
import { UserUpdateCredentialDTO } from 'src/common/DTO/user.credential.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /* ---- RAW METHODS ---- */

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
      throw new BadRequestException('Invalid ID provided', {
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
        throw new ConflictException('Username or email already exists');
      }
      throw new BadRequestException('Invalid user data provided');
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
  async compareUserData(user: User): Promise<boolean> {
    const validateUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
        companyName: user.companyName,
      },
    });

    if (!validateUser) {
      throw new NotFoundException('User not found');
    }
    return true;
  }

  /* ---- SERVICE METHODS ---- */

  // update user account information
  async updateAccountService(
    user: User,
    userData: UserUpdateCredentialDTO,
  ): Promise<User> {
    // Check if the user exists
    if (!user || !userData) {
      throw new NotFoundException('User not found');
    }

    let hashedPassword = user.password;
    const userExists = await this.findOne(user.id);
    if (userData.oldPassword) {
      if (
        bcryptjs.compareSync(userData.oldPassword, userExists.password) &&
        userData.newPassword === userData.confirmPassword
      ) {
        const salt: string = await bcryptjs.genSalt(10);
        hashedPassword = await bcryptjs.hash(userData.newPassword, salt);
      } else {
        throw new BadRequestException('Invalid password');
      }
    }

    return await this.updateUser(user.id, {
      ...userData,
      password: hashedPassword,
      updatedAt: new Date(),
    });
  }

  // delte user account
  async deleteAccountService(user: User): Promise<User> {
    // Check if the user exists
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete the user
    const userRemove = await this.deleteUser(user.id);

    return userRemove;
  }
}
