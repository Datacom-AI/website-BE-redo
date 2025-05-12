import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductCategory, Prisma, UserRole } from 'generated/prisma';
import { ProductCategoryCreateDTO } from 'src/common/DTO/product/productCategory/productCategory.Create.dto';
import { ProductCategoryUpdateDTO } from 'src/common/DTO/product/productCategory/productCategory.Update.dto';

interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

@Injectable()
export class ProductCategoryService {
  constructor(private prisma: PrismaService) {}

  async createProductCategory(
    dto: ProductCategoryCreateDTO,
    userId: string,
  ): Promise<ProductCategory> {
    try {
      return await this.prisma.productCategory.create({
        data: {
          name: dto.name,
          createdById: userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Product category with name '${dto.name}' already exists.`,
          );
        }
      }
      throw error;
    }
  }

  async findAllProductCategory(): Promise<ProductCategory[]> {
    return this.prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOneProductCategory(id: string): Promise<ProductCategory> {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(
        `Product category with ID '${id}' not found.`,
      );
    }

    return category;
  }

  async updateProductCategory(
    id: string,
    dto: ProductCategoryUpdateDTO,
    user: AuthenticatedUser,
  ): Promise<ProductCategory> {
    const category = await this.findOneProductCategory(id);

    if (!category) {
      throw new NotFoundException(
        `Product category with ID '${id}' not found.`,
      );
    }

    if (
      user.role === UserRole.manufacturer &&
      category.createdById !== user.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this product category.',
      );
    }

    try {
      return await this.prisma.productCategory.update({
        where: { id },
        data: {
          name: dto.name,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Product category with name '${dto.name}' already exists.`,
          );
        }
      }
      throw error;
    }
  }

  async removeProductCategory(
    id: string,
    user: AuthenticatedUser,
  ): Promise<ProductCategory> {
    const category = await this.findOneProductCategory(id);

    if (!category) {
      throw new NotFoundException(
        `Product category with ID '${id}' not found.`,
      );
    }

    if (
      user.role === UserRole.manufacturer &&
      category.createdById !== user.id
    ) {
      throw new ForbiddenException(
        `You do not have permission to delete this product category.`,
      );
    }

    const productsCount = await this.prisma.catalogProduct.count({
      where: { productCategoryId: id },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        `Cannot delete category '${category.name}' as it has ${productsCount} associated products. Please reassign or delete them first.`,
      );
    }

    return this.prisma.productCategory.delete({
      where: { id },
    });
  }
}
