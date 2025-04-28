import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // get all products
  async getAllProducts(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    return products;
  }

  // get product by id
  async getProductById(id: string): Promise<Product> {
    if (!id) {
      throw new NotFoundException('Product ID is required');
    }
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      if (error.code === 'P2023') {
        throw error;
      }

      throw new BadRequestException(`Invalid ID format: ${id}`);
    }
  }

  // create product
  async createProduct(data: Product): Promise<Product> {
    if (!data) {
      throw new BadRequestException('Product data is required');
    }

    const { ...productData } = data;
    let newRecord: Product;

    try {
      newRecord = await this.prisma.product.create({
        data: {
          ...productData,
        },
      });
    } catch (error) {
      throw new BadRequestException('Error creating product');
    }

    return newRecord;
  }
}
