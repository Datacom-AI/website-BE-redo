import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductCategoryService } from './productCategory/productCategory.service';
import { ConfigService } from '@nestjs/config';

import * as path from 'path';
import * as fs from 'fs/promises';
import {
  CatalogProduct,
  LeadTimeUnit,
  Prisma,
  ProductType,
  UnitType,
} from 'generated/prisma';
import { ProductCatalogCreateDTO } from 'src/common/DTO/product/product.catalog.Create.dto';
import { ProductCatalogReadDTO } from 'src/common/DTO/product/product.catalog.Read.dto';
import { ProductCategoryReadDTO } from 'src/common/DTO/product/productCategory/productCategory.Read.dto';
import { createImageName, removeImage, saveImage } from 'src/common/utils';
import { ProductCatalogUpdateDTO } from 'src/common/DTO/product/product.catalog.Update.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private prisma: PrismaService,
    private readonly productCategoryService: ProductCategoryService,
    private readonly configService: ConfigService,
  ) {}

  private getUploadPath(subdir: 'product-images'): string {
    const basePath =
      this.configService.get<string>('UPLOAD_PATH') || 'src/uploads';
    return path.join(basePath, subdir);
  }

  private mapProductToReadDTO(
    product: CatalogProduct & {
      productCategory?: any;
      manufacturerDetails?: any;
    },
  ): ProductCatalogReadDTO {
    const baseUrl =
      this.configService.get<string>('API_BASE_URL') || 'http://localhost:3000';

    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    let productCategoryDTO: ProductCategoryReadDTO | undefined = undefined;
    if (product.productCategory) {
      productCategoryDTO = {
        id: product.productCategory.id,
        name: product.productCategory.name,
        createdAt: product.productCategory.createdAt,
        updatedAt: product.productCategory.updatedAt,
      };
    }

    return {
      id: product.id,
      manufacturerDetailsId: product.manufacturerDetailsId,
      productCategory: productCategoryDTO,
      name: product.name,
      minimumOrderQuantity: product.minimumOrderQuantity,
      dailyCapacity: product.dailyCapacity,
      unitType: product.unitType,
      stockLevel: product.stockLevel,
      pricePerUnit: product.pricePerUnit,
      productType: product.productType,
      leadTime: product.leadTime,
      leadTimeUnit: product.leadTimeUnit,
      description: product.description,
      image: product.image
        ? `${baseUrl}/uploads/product-images/${product.image}`
        : null,
      isSustainableProduct: product.isSustainableProduct,
      productSKU: product.productSKU,
      isBestSeller: product.isBestSeller,
      isPopular: product.isPopular,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private async ensureUploadPathExists(directory: string): Promise<void> {
    try {
      await fs.mkdir(directory, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create directory: ${directory}`, error);
    }
  }

  private async getManufacturerDetailsId(userId: string): Promise<string> {
    const userWithProfile = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            manufacturerDetails: true,
          },
        },
      },
    });

    if (!userWithProfile || userWithProfile.role !== 'manufacturer') {
      throw new ForbiddenException('User is not a manufacturer');
    }

    const manufacturerDetails = userWithProfile.profile?.manufacturerDetails;

    if (!manufacturerDetails?.id) {
      console.error(userWithProfile);
      throw new ForbiddenException(
        'Manufacturer details not found for this user. Please contact support.',
      );
    }

    return manufacturerDetails.id;
  }

  async createProduct(
    manufacturerUserId: string,
    dto: ProductCatalogCreateDTO,
    productImageFile?: Express.Multer.File,
  ): Promise<ProductCatalogReadDTO> {
    const manufacturerDetailsId =
      await this.getManufacturerDetailsId(manufacturerUserId);

    await this.productCategoryService.findOneProductCategory(
      dto.productCategoryId,
    );

    let imageName: string | undefined = undefined;
    if (productImageFile) {
      const productImagePath = this.getUploadPath('product-images');
      await this.ensureUploadPathExists(productImagePath);
      imageName = createImageName(productImageFile);
      await saveImage(productImageFile, path.join(productImagePath, imageName));
    }

    try {
      const productData: Prisma.CatalogProductCreateInput = {
        name: dto.name,
        productSKU: dto.productSKU,
        minimumOrderQuantity: dto.minimumOrderQuantity,
        dailyCapacity: dto.dailyCapacity,
        stockLevel: dto.stockLevel, // Changed from dto.currentAvailableStock
        pricePerUnit: dto.pricePerUnit,
        description: dto.description,
        image: imageName,
        unitType: dto.unitType || UnitType.units,
        productType: dto.productType || ProductType.finishedGood,
        leadTime: dto.leadTime,
        leadTimeUnit: dto.leadTimeUnit || LeadTimeUnit.days,
        isSustainableProduct: dto.isSustainableProduct ?? false,
        isBestSeller: dto.isBestSeller ?? false,
        isPopular: dto.isPopular ?? false,
        manufacturerDetails: { connect: { id: manufacturerDetailsId } },
        productCategory: { connect: { id: dto.productCategoryId } },
      };

      const createdProduct = await this.prisma.catalogProduct.create({
        data: productData,
        include: {
          productCategory: true,
          manufacturerDetails: {
            select: {
              profile: { select: { user: { select: { name: true } } } },
            },
          },
        },
      });

      return this.mapProductToReadDTO(createdProduct);
    } catch (error) {
      if (productImageFile && imageName) {
        try {
          await removeImage(
            path.join(this.getUploadPath('product-images'), imageName),
          );
        } catch (error) {
          this.logger.error(
            `Failed to remove image after error: ${error}`,
            error,
          );
        }
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // unique constraint violation (e.g. [manufacturerDetailsId, productSKU])
          const target = error.meta?.target as string[];
          if (
            target?.includes('productSKU') &&
            target?.includes('manufacturerDetailsId')
          ) {
            throw new ConflictException(
              `Product with SKU '${dto.productSKU}' already exists for this manufacturer.`,
            );
          }
          throw new ConflictException(
            'A product with similar unique details already exists.',
          );
        }
      }

      this.logger.error(`Failed to create product: ${error.message}`, error);
      throw new BadRequestException(
        'Could not create product. Please try again.',
      );
    }
  }

  async findAllProductsByManufacturer(
    manufacturerUserId: string,
  ): Promise<ProductCatalogReadDTO[]> {
    const manufacturerDetailsId =
      await this.getManufacturerDetailsId(manufacturerUserId);

    return this.prisma.catalogProduct.findMany({
      where: { manufacturerDetailsId },
      include: { productCategory: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneProduct(productId: string): Promise<ProductCatalogReadDTO> {
    const product = await this.prisma.catalogProduct.findUnique({
      where: { id: productId },
      include: {
        productCategory: true,
        manufacturerDetails: {
          select: { profile: { select: { user: { select: { name: true } } } } },
        },
      }, // Include relations needed for DTO mapping
    });

    if (!product) {
      throw new BadRequestException(
        `Product with ID '${productId}' not found.`,
      );
    }

    return this.mapProductToReadDTO(product);
  }

  async updateProduct(
    manufacturerUserId: string,
    productId: string,
    dto: ProductCatalogUpdateDTO,
    productImageFile?: Express.Multer.File,
  ): Promise<ProductCatalogReadDTO> {
    const manufacturerDetailsId =
      await this.getManufacturerDetailsId(manufacturerUserId);

    const existingProduct = await this.prisma.catalogProduct.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      throw new ForbiddenException(`Product with ID '${productId}' not found.`);
    }

    if (existingProduct.manufacturerDetailsId !== manufacturerDetailsId) {
      throw new ForbiddenException(
        `You do not have permission to update this product.`,
      );
    }

    if (dto.productCategoryId) {
      await this.productCategoryService.findOneProductCategory(
        dto.productCategoryId,
      );
    }

    let newImageName: string | undefined = undefined;
    const updateData: Prisma.CatalogProductUpdateInput = { ...dto };

    if (productImageFile) {
      const productImagePath = this.getUploadPath('product-images');
      await this.ensureUploadPathExists(productImagePath);
      newImageName = createImageName(productImageFile);
      await saveImage(
        productImageFile,
        path.join(productImagePath, newImageName),
      );
      updateData.image = newImageName;

      if (existingProduct.image) {
        try {
          await removeImage(
            path.join(
              this.getUploadPath('product-images'),
              existingProduct.image,
            ),
          );
        } catch (error) {
          this.logger.error(
            `Failed to remove old image after error: ${error}`,
            error,
          );
        }
      }
    } else if (dto.image === null) {
      if (existingProduct.image) {
        try {
          await removeImage(
            path.join(
              this.getUploadPath('product-images'),
              existingProduct.image,
            ),
          );

          updateData.image = null;
        } catch (error) {
          this.logger.warn(
            `Failed to remove old image after error: ${error}`,
            error,
          );

          updateData.image = null;
        }
      }
    }

    if (dto.stockLevel !== undefined) {
      updateData.stockLevel = dto.stockLevel;
    }

    try {
      const updatedProduct = await this.prisma.catalogProduct.update({
        where: { id: productId },
        data: updateData,
        include: {
          productCategory: true,
          manufacturerDetails: {
            select: {
              profile: { select: { user: { select: { name: true } } } },
            },
          },
        },
      });

      return this.mapProductToReadDTO(updatedProduct);
    } catch (error) {
      if (newImageName) {
        try {
          await removeImage(
            path.join(this.getUploadPath('product-images'), newImageName),
          );
        } catch (error) {
          this.logger.error(
            `Failed to remove image after error: ${error}`,
            error,
          );
        }
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Product with name '${dto.productSKU}' already exists for this manufacturer or other unique constraint failed.`,
          );
        }
      }
      this.logger.error(
        `Failed to update product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Could not update product.');
    }
  }

  async deleteProduct(
    manufacturerUserId: string,
    productId: string,
  ): Promise<void> {
    const manufacturerDetailsId =
      await this.getManufacturerDetailsId(manufacturerUserId);

    const product = await this.prisma.catalogProduct.findUnique({
      where: { id: productId },
      include: { orders: { take: 1 } },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' not found.`);
    }

    if (product.manufacturerDetailsId !== manufacturerDetailsId) {
      throw new ForbiddenException(
        `You do not have permission to delete this product.`,
      );
    }

    if (product.orders && product.orders.length > 0) {
      throw new BadRequestException(
        'Cannot delete product with active orders.',
      );
    }

    const oldImageName = product.image;

    try {
      await this.prisma.catalogProduct.delete({
        where: { id: productId },
      });

      if (oldImageName) {
        try {
          await removeImage(
            path.join(this.getUploadPath('product-images'), oldImageName),
          );
        } catch (error) {
          this.logger.warn(
            `Failed to remove image file for deleted product ${productId}: ${oldImageName}`,
            error,
          );
        }
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003' || error.code === 'P2014') {
          this.logger.error(
            `Foreign key constraint failed when deleting product ${productId}: ${error.message}`,
            error.stack,
          );
          throw new BadRequestException(
            'Cannot delete this product as it is referenced by other entities (e.g., orders, inventory items). Please remove references first.',
          );
        }
      }
      this.logger.error(
        `Failed to delete product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Could not delete product.');
    }
  }
}
