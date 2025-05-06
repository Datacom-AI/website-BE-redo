import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogProduct } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // get all products
  async getAllProducts(): Promise<CatalogProduct[]> {
    const products = await this.prisma.catalogProduct.findMany();
    return products;
  }

  // get product by id
  async getProductById(id: string): Promise<CatalogProduct> {
    if (!id) {
      throw new NotFoundException('Product ID is required');
    }
    try {
      const product = await this.prisma.catalogProduct.findFirst({
        where: {
          id,
        },
        include: {
          productCategory: true,
        },
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
  async createProduct(data: CatalogProduct): Promise<CatalogProduct> {
    if (!data) {
      throw new BadRequestException('Product data is required');
    }

    const { ...productData } = data;
    let newRecord: CatalogProduct;

    try {
      newRecord = await this.prisma.catalogProduct.create({
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
