import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  RetailerProduct,
  ProductCategory,
  UserRole,
  Prisma,
  RetailerDetails as PrismaRetailerDetails,
} from 'generated/prisma';
import { RetailerProductCreateDTO } from 'src/common/DTO/retailerProduct/retailerProduct.Create.dto';
import { RetailerProductUpdateDTO } from 'src/common/DTO/retailerProduct/retailerProduct.Update.dto';
import { RetailerProductReadDTO } from 'src/common/DTO/retailerProduct/retailerProduct.Read.dto';
import { AuthenticatedUser } from 'src/common/interface';

type RetailerProductWithDetails = RetailerProduct & {
  category: ProductCategory;
  retailerDetails: { profileId: string } | null;
};

@Injectable()
export class RetailerProductService {
  constructor(private prisma: PrismaService) {}

  private async getRetailerDetailsByProfileId(
    profileId: string,
  ): Promise<PrismaRetailerDetails> {
    const retailerDetails = await this.prisma.retailerDetails.findUnique({
      where: { profileId },
    });
    if (!retailerDetails) {
      throw new NotFoundException(
        `Retailer details not found for profile ID ${profileId}.`,
      );
    }
    return retailerDetails;
  }

  private async verifyUserAccessToRetailerProfile(
    profileId: string,
    user: AuthenticatedUser,
  ): Promise<PrismaRetailerDetails> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { userId: true, role: true },
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${profileId} not found.`);
    }

    if (profile.role !== UserRole.retailer) {
      throw new BadRequestException(
        `Profile ID ${profileId} does not belong to a retailer.`,
      );
    }

    if (user.role !== UserRole.admin && profile.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to access this retailer profile.',
      );
    }

    // User is admin or owns the profile, now get RetailerDetails
    return this.getRetailerDetailsByProfileId(profileId);
  }

  private mapToReadDTO(
    product: RetailerProductWithDetails,
  ): RetailerProductReadDTO {
    if (!product.retailerDetails?.profileId) {
      // This case should ideally not happen if data integrity is maintained
      // and queries always include the necessary relations.
      throw new Error(`Retailer profile ID missing for product ${product.id}`);
    }
    return {
      id: product.id,
      retailerProfileId: product.retailerDetails.profileId,
      categoryId: product.categoryId,
      category: {
        id: product.category.id,
        name: product.category.name,
        createdAt: product.category.createdAt,
        updatedAt: product.category.updatedAt,
      },
      sku: product.sku,
      name: product.name,
      description: product.description,
      stockLevel: product.stockLevel,
      needsRestock: product.needsRestock,
      reorderPoint: product.reorderPoint,
      price: product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async create(
    dto: RetailerProductCreateDTO,
    user: AuthenticatedUser,
  ): Promise<RetailerProductReadDTO> {
    const retailerDetails = await this.verifyUserAccessToRetailerProfile(
      dto.retailerProfileId,
      user,
    );

    const category = await this.prisma.productCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Product category with ID ${dto.categoryId} not found.`,
      );
    }

    try {
      const newRetailerProduct = await this.prisma.retailerProduct.create({
        data: {
          name: dto.name,
          sku: dto.sku,
          description: dto.description,
          stockLevel: dto.stockLevel,
          needsRestock: dto.needsRestock,
          reorderPoint: dto.reorderPoint,
          price: dto.price,
          retailerDetails: { connect: { id: retailerDetails.id } },
          category: { connect: { id: dto.categoryId } },
        },
        include: {
          category: true,
          retailerDetails: { select: { profileId: true } },
        },
      });
      return this.mapToReadDTO(
        newRetailerProduct as RetailerProductWithDetails,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          throw new ConflictException(
            `A retailer product with SKU '${dto.sku}' already exists for this retailer.`,
          );
        }
      }
      throw error;
    }
  }

  async findAllByRetailerProfileId(
    retailerProfileId: string,
    user: AuthenticatedUser,
  ): Promise<RetailerProductReadDTO[]> {
    await this.verifyUserAccessToRetailerProfile(retailerProfileId, user);

    const retailerDetails =
      await this.getRetailerDetailsByProfileId(retailerProfileId);

    const products = await this.prisma.retailerProduct.findMany({
      where: { retailerDetailsId: retailerDetails.id },
      include: {
        category: true,
        retailerDetails: { select: { profileId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return products.map((p) =>
      this.mapToReadDTO(p as RetailerProductWithDetails),
    );
  }

  async findOne(
    id: string,
    user: AuthenticatedUser,
  ): Promise<RetailerProductReadDTO> {
    const product = await this.prisma.retailerProduct.findUnique({
      where: { id },
      include: {
        category: true,
        retailerDetails: { include: { profile: true } }, // Include full profile for ownership check
      },
    });

    if (!product) {
      throw new NotFoundException(`Retailer product with ID ${id} not found.`);
    }
    if (!product.retailerDetails?.profile?.userId) {
      throw new NotFoundException(
        `Retailer details or profile missing for product ID ${id}.`,
      );
    }

    if (
      user.role !== UserRole.admin &&
      product.retailerDetails.profile.userId !== user.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to access this product.',
      );
    }
    // Cast to RetailerProductWithDetails after ensuring retailerDetails and profileId exist
    const productWithProfileId = {
      ...product,
      retailerDetails: { profileId: product.retailerDetails.profileId },
    };
    return this.mapToReadDTO(
      productWithProfileId as RetailerProductWithDetails,
    );
  }

  async update(
    id: string,
    dto: RetailerProductUpdateDTO,
    user: AuthenticatedUser,
  ): Promise<RetailerProductReadDTO> {
    const existingProduct = await this.prisma.retailerProduct.findUnique({
      where: { id },
      include: { retailerDetails: { include: { profile: true } } },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Retailer product with ID ${id} not found.`);
    }
    if (!existingProduct.retailerDetails?.profile?.userId) {
      throw new NotFoundException(
        `Retailer details or profile missing for product ID ${id}.`,
      );
    }

    if (
      user.role !== UserRole.admin &&
      existingProduct.retailerDetails.profile.userId !== user.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this product.',
      );
    }

    if (dto.categoryId) {
      const category = await this.prisma.productCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Product category with ID ${dto.categoryId} not found.`,
        );
      }
    }

    // Note: SKU is not updatable via this DTO. If it were, unique constraint handling would be needed.

    const updatedProduct = await this.prisma.retailerProduct.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        stockLevel: dto.stockLevel,
        needsRestock: dto.needsRestock,
        reorderPoint: dto.reorderPoint,
        price: dto.price,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
        retailerDetails: { select: { profileId: true } },
      },
    });
    return this.mapToReadDTO(updatedProduct as RetailerProductWithDetails);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const product = await this.prisma.retailerProduct.findUnique({
      where: { id },
      include: { retailerDetails: { include: { profile: true } } },
    });

    if (!product) {
      throw new NotFoundException(`Retailer product with ID ${id} not found.`);
    }
    if (!product.retailerDetails?.profile?.userId) {
      throw new NotFoundException(
        `Retailer details or profile missing for product ID ${id}.`,
      );
    }

    if (
      user.role !== UserRole.admin &&
      product.retailerDetails.profile.userId !== user.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this product.',
      );
    }

    await this.prisma.retailerProduct.delete({ where: { id } });
  }
}
