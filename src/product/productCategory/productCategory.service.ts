import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductCategory, Prisma } from 'generated/prisma';
import { ProductCategoryCreateDTO } from 'src/common/DTO/product/productCategory/productCategory.Create.dto';
import { ProductCategoryUpdateDTO } from 'src/common/DTO/product/productCategory/productCategory.Update.dto';

@Injectable()
export class ProductCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: ProductCategoryCreateDTO): Promise<ProductCategory> {
    try {
      return await this.prisma.productCategory.create({
        data: {
          name: dto.name,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          throw new ConflictException(
            `Product category with name '${dto.name}' already exists.`,
          );
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<ProductCategory[]> {
    return this.prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<ProductCategory> {
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

  async update(
    id: string,
    dto: ProductCategoryUpdateDTO,
  ): Promise<ProductCategory> {
    await this.findOne(id); // Ensure category exists
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

  async remove(id: string): Promise<ProductCategory> {
    const category = await this.findOne(id); // Ensure category exists

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
