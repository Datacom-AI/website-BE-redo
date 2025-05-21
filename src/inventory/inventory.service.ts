import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { InventoryItemCreateDTO } from 'src/common/DTO/inventory/inventory.items.Create.dto';
import { InventoryItemReadDTO } from 'src/common/DTO/inventory/inventory.items.Read.dto';
import { InventoryItemUpdateDTO } from 'src/common/DTO/inventory/inventory.items.Update.dto';
import { Prisma } from '../../generated/prisma';
import { ProductService } from '../product/product.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  private mapToReadDTO(item: any): InventoryItemReadDTO {
    return {
      id: item.id,
      manufacturerDetailsId: item.manufacturerDetailsId,
      itemName: item.itemName,
      itemCategory: item.itemCategory,
      itemSKU: item.itemSKU,
      currentStock: item.currentStock,
      maximumStock: item.maximumStock,
      storageLocation: item.storageLocation,
      description: item.description,
      catalogProductId: item.catalogProductId,
      catalogProduct: item.catalogProduct || undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  constructor(
    private prisma: PrismaService,
    private productService: ProductService,
  ) {}

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
      this.logger.error('Manufacturer details not found', userWithProfile);
      throw new ForbiddenException(
        'Manufacturer details not found for this user. Please contact support.',
      );
    }

    return manufacturerDetails.id;
  }

  async createInventoryItem(
    userId: string,
    dto: InventoryItemCreateDTO,
  ): Promise<InventoryItemReadDTO> {
    const manufacturerDetailsId = await this.getManufacturerDetailsId(userId);

    if (dto.catalogProductId) {
      try {
        const product = await this.productService.findOneProduct(
          dto.catalogProductId,
        );

        if (product.manufacturerDetailsId !== manufacturerDetailsId) {
          throw new ForbiddenException(
            'You can only link inventory items to your own catalog products',
          );
        }
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            'Invalid catalog product ID: Product not found',
          );
        }
        this.logger.error(
          `Catalog product not found: ${dto.catalogProductId}: ${error.message}`,
          error.stack,
        );
        throw new BadRequestException('Error validating catalog product ID');
      }
    }

    try {
      const inventoryItem = await this.prisma.inventoryItem.create({
        data: {
          manufacturerDetails: { connect: { id: manufacturerDetailsId } },
          itemName: dto.itemName,
          itemCategory: dto.itemCategory,
          itemSKU: dto.itemSKU,
          currentStock: dto.currentStock,
          maximumStock: dto.maximumStock,
          storageLocation: dto.storageLocation,
          description: dto.description,
          ...(dto.catalogProductId && {
            catalogProduct: { connect: { id: dto.catalogProductId } },
          }),
        },
        include: {
          catalogProduct: true,
        },
      });

      return this.mapToReadDTO(inventoryItem);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `An inventory item with SKU '${dto.itemSKU}' already exists for this manufacturer`,
          );
        }
      }
      this.logger.error(
        `Failed to create inventory item: ${error.message}`,
        error,
      );
      throw new BadRequestException(
        'Could not create inventory item. Please try again.',
      );
    }
  }

  async findAllInventoryItems(userId: string): Promise<InventoryItemReadDTO[]> {
    const manufacturerDetailsId = await this.getManufacturerDetailsId(userId);

    const items = await this.prisma.inventoryItem.findMany({
      where: { manufacturerDetailsId },
      include: { catalogProduct: true },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => this.mapToReadDTO(item));
  }

  async findOneInventoryItem(
    userId: string,
    itemId: string,
  ): Promise<InventoryItemReadDTO> {
    const manufacturerDetailsId = await this.getManufacturerDetailsId(userId);

    const item = await this.prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        manufacturerDetailsId,
      },
      include: { catalogProduct: true },
    });

    if (!item) {
      throw new NotFoundException(
        `Inventory item with ID '${itemId}' not found`,
      );
    }

    return this.mapToReadDTO(item);
  }

  async updateInventoryItem(
    userId: string,
    itemId: string,
    dto: InventoryItemUpdateDTO,
  ): Promise<InventoryItemReadDTO> {
    const manufacturerDetailsId = await this.getManufacturerDetailsId(userId);

    const existingItem = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, manufacturerDetailsId },
    });

    if (!existingItem) {
      throw new NotFoundException(
        `Inventory item with ID '${itemId}' not found or does not belong to this manufacturer`,
      );
    }

    if (dto.catalogProductId) {
      try {
        const product = await this.productService.findOneProduct(
          dto.catalogProductId,
        );

        if (product.manufacturerDetailsId !== manufacturerDetailsId) {
          throw new ForbiddenException(
            'You can only link inventory items to your own catalog products',
          );
        }
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            'Invalid catalog product ID: Product not found.',
          );
        }
        this.logger.error(
          `Error validating product ID ${dto.catalogProductId}: ${error.message}`,
          error.stack,
        );
        throw new BadRequestException('Error validating catalog product ID.');
      }
    }

    try {
      const updatedItem = await this.prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
          ...(dto.itemName && { itemName: dto.itemName }),
          ...(dto.itemCategory && { itemCategory: dto.itemCategory }),
          ...(dto.currentStock !== undefined && {
            currentStock: dto.currentStock,
          }),
          ...(dto.maximumStock !== undefined && {
            maximumStock: dto.maximumStock,
          }),
          ...(dto.storageLocation !== undefined && {
            storageLocation: dto.storageLocation,
          }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.catalogProductId && {
            catalogProduct: { connect: { id: dto.catalogProductId } },
          }),
          // If catalogProductId is explicitly null, disconnect the relation
          ...(dto.catalogProductId === null && {
            catalogProduct: { disconnect: true },
          }),
        },
        include: { catalogProduct: true },
      });

      return this.mapToReadDTO(updatedItem);
    } catch (error) {
      this.logger.error(
        `Failed to update inventory item: ${error.message}`,
        error,
      );
      throw new BadRequestException(
        'Could not update inventory item. Please try again.',
      );
    }
  }

  async deleteInventoryItem(userId: string, itemId: string): Promise<void> {
    const manufacturerDetailsId = await this.getManufacturerDetailsId(userId);

    // Check if the item exists and belongs to the manufacturer
    const existingItem = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, manufacturerDetailsId },
    });

    if (!existingItem) {
      throw new NotFoundException(
        `Inventory item with ID '${itemId}' not found or does not belong to this manufacturer`,
      );
    }

    try {
      await this.prisma.inventoryItem.delete({
        where: { id: itemId },
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete inventory item: ${error.message}`,
        error,
      );
      throw new BadRequestException(
        'Could not delete inventory item. Please try again.',
      );
    }
  }
}
