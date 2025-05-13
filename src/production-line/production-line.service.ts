import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, ProductionLine, UserRole } from 'generated/prisma';
import { ProductionLineCreateDTO } from 'src/common/DTO/productionLine/productionLine.Create.dto';
import { ProductionLineUpdateDTO } from 'src/common/DTO/productionLine/productionLine.Update.dto';
import { ProductionLineReadDTO } from 'src/common/DTO/productionLine/productionLine.Read.dto';
import { ProductionLineQueryDTO } from 'src/common/DTO/productionLine/productionLine.Query.dto';
import { AuthenticatedUser } from 'src/common/interface';

@Injectable()
export class ProductionLineService {
  private readonly logger = new Logger(ProductionLineService.name);

  constructor(private prisma: PrismaService) {}

  private async verifyManufacturerAccess(
    user: AuthenticatedUser,
    manufacturerDetailsId: string,
  ): Promise<void> {
    if (user.role === UserRole.admin) {
      // Admin can access any, but we still need to check if manufacturerDetailsId is valid
      const manufacturerDetails =
        await this.prisma.manufacturerDetails.findUnique({
          where: { id: manufacturerDetailsId },
        });
      if (!manufacturerDetails) {
        throw new NotFoundException(
          `ManufacturerDetails with ID ${manufacturerDetailsId} not found.`,
        );
      }
      return;
    }

    if (user.role === UserRole.manufacturer) {
      const manufacturerDetails =
        await this.prisma.manufacturerDetails.findUnique({
          where: { id: manufacturerDetailsId },
          select: { profile: { select: { userId: true } } },
        });
      if (!manufacturerDetails) {
        throw new NotFoundException(
          `ManufacturerDetails with ID ${manufacturerDetailsId} not found.`,
        );
      }
      if (manufacturerDetails.profile.userId !== user.id) {
        throw new ForbiddenException(
          'User does not own this ManufacturerDetails record.',
        );
      }
    } else {
      throw new ForbiddenException('User role not permitted for this action.');
    }
  }

  private mapToReadDTO(productionLine: ProductionLine): ProductionLineReadDTO {
    return {
      id: productionLine.id,
      manufacturerDetailsId: productionLine.manufacturerDetailsId,
      name: productionLine.name,
      lineType: productionLine.lineType,
      capacityValue: productionLine.capacityValue,
      capacityUnit: productionLine.capacityUnit,
      initialStatus: productionLine.initialStatus,
      operatorAssigned: productionLine.operatorAssigned,
      targetEfficiency: productionLine.targetEfficiency,
      nextMaintenanceDate: productionLine.nextMaintenanceDate?.toISOString(),
      notes: productionLine.notes,
      createdAt: productionLine.createdAt,
      updatedAt: productionLine.updatedAt,
    };
  }

  private validateNextMaintenanceDate(dateStr?: string) {
    if (dateStr && new Date(dateStr) <= new Date()) {
      throw new BadRequestException(
        'Next maintenance date must be in the future.',
      );
    }
  }

  async create(
    user: AuthenticatedUser,
    dto: ProductionLineCreateDTO,
  ): Promise<ProductionLineReadDTO> {
    await this.verifyManufacturerAccess(user, dto.manufacturerDetailsId);
    this.validateNextMaintenanceDate(dto.nextMaintenanceDate);

    try {
      const dataToCreate: Prisma.ProductionLineCreateInput = {
        manufacturerDetails: { connect: { id: dto.manufacturerDetailsId } },
        name: dto.name,
        lineType: dto.lineType,
        capacityValue: dto.capacityValue,
        capacityUnit: dto.capacityUnit,
        operationalSince: new Date(dto.operationalSince), // Added
        initialStatus: dto.initialStatus,
        operatorAssigned: dto.operatorAssigned,
        targetEfficiency: dto.targetEfficiency,
        nextMaintenanceDate: dto.nextMaintenanceDate,
        notes: dto.notes,
      };

      if (dto.nextMaintenanceDate) {
        dataToCreate.nextMaintenanceDate = new Date(dto.nextMaintenanceDate);
      }

      const productionLine = await this.prisma.productionLine.create({
        data: dataToCreate,
      });

      return this.mapToReadDTO(productionLine);
    } catch (error) {
      this.logger.error(
        `Failed to create production line: ${error.message}`,
        error.stack,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if needed, e.g., P2002 for unique constraints
      }
      throw new BadRequestException('Could not create production line.');
    }
  }

  async findAll(
    user: AuthenticatedUser,
    manufacturerDetailsId: string,
    query: ProductionLineQueryDTO,
  ): Promise<ProductionLineReadDTO[]> {
    await this.verifyManufacturerAccess(user, manufacturerDetailsId);

    const where: Prisma.ProductionLineWhereInput = {
      manufacturerDetailsId: manufacturerDetailsId,
      ...(query.minCapacityValue !== undefined && {
        capacityValue: { gte: query.minCapacityValue },
      }),
      ...(query.maxCapacityValue !== undefined && {
        capacityValue: { lte: query.maxCapacityValue },
      }),
      // Add other filters from query DTO as needed (e.g., lineType, status)
    };

    const productionLines = await this.prisma.productionLine.findMany({
      where,
      orderBy: query.orderBy
        ? { [query.orderBy]: query.orderDirection || 'asc' }
        : { createdAt: 'desc' },
      skip: query.offset,
      take: query.limit,
    });
    return productionLines.map((productionLine) =>
      this.mapToReadDTO(productionLine),
    );
  }

  async findOne(
    user: AuthenticatedUser,
    manufacturerDetailsId: string,
    productionLineId: string,
  ): Promise<ProductionLineReadDTO> {
    await this.verifyManufacturerAccess(user, manufacturerDetailsId);

    const productionLine = await this.prisma.productionLine.findUnique({
      where: { id: productionLineId },
    });

    if (
      !productionLine ||
      productionLine.manufacturerDetailsId !== manufacturerDetailsId
    ) {
      throw new NotFoundException(
        `ProductionLine with ID ${productionLineId} not found under ManufacturerDetails ID ${manufacturerDetailsId}.`,
      );
    }
    return this.mapToReadDTO(productionLine);
  }

  async update(
    user: AuthenticatedUser,
    manufacturerDetailsId: string,
    productionLineId: string,
    dto: ProductionLineUpdateDTO,
  ): Promise<ProductionLineReadDTO> {
    await this.verifyManufacturerAccess(user, manufacturerDetailsId);
    this.validateNextMaintenanceDate(dto.nextMaintenanceDate);

    const existingProductionLine = await this.prisma.productionLine.findFirst({
      where: {
        id: productionLineId,
        manufacturerDetailsId: manufacturerDetailsId,
      },
    });

    if (!existingProductionLine) {
      throw new NotFoundException(
        `ProductionLine with ID ${productionLineId} not found under ManufacturerDetails ID ${manufacturerDetailsId}.`,
      );
    }

    try {
      const updatedProductionLine = await this.prisma.productionLine.update({
        where: { id: productionLineId },
        data: {
          name: dto.name,
          lineType: dto.lineType,
          capacityValue: dto.capacityValue,
          capacityUnit: dto.capacityUnit,
          initialStatus: dto.initialStatus,
          operatorAssigned: dto.operatorAssigned,
          targetEfficiency: dto.targetEfficiency,
          nextMaintenanceDate: dto.nextMaintenanceDate
            ? new Date(dto.nextMaintenanceDate)
            : undefined,
          notes: dto.notes,
        },
      });
      return this.mapToReadDTO(updatedProductionLine);
    } catch (error) {
      this.logger.error(
        `Failed to update production line ${productionLineId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Could not update production line.');
    }
  }

  async remove(
    user: AuthenticatedUser,
    manufacturerDetailsId: string,
    productionLineId: string,
  ): Promise<void> {
    await this.verifyManufacturerAccess(user, manufacturerDetailsId);

    const existingProductionLine = await this.prisma.productionLine.findFirst({
      where: {
        id: productionLineId,
        manufacturerDetailsId: manufacturerDetailsId,
      },
    });

    if (!existingProductionLine) {
      throw new NotFoundException(
        `ProductionLine with ID ${productionLineId} not found under ManufacturerDetails ID ${manufacturerDetailsId}.`,
      );
    }

    try {
      await this.prisma.productionLine.delete({
        where: { id: productionLineId },
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete production line ${productionLineId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Could not delete production line.');
    }
  }
}
