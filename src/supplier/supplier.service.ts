import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Supplier, UserRole } from 'generated/prisma';
import { SupplierCreateDTO } from 'src/common/DTO/supplier/supplier.Create.dto';
import { SupplierUpdateDTO } from 'src/common/DTO/supplier/supplier.Update.dto';
import { SupplierReadDTO } from 'src/common/DTO/supplier/supplier.Read.dto';
import { SupplierQueryDTO } from 'src/common/DTO/supplier/supplier.query.dto';
import { SupplierMaterialReadDTO } from 'src/common/DTO/supplier/supplier.material.Read.dto';

type SupplierWithDetails = Supplier & {
  materials: Prisma.SupplierMaterialGetPayload<{
    include: { supplier: false };
  }>[];
};

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name);

  constructor(private prisma: PrismaService) {}

  private async validateUserRole(userId: string, allowedRoles: UserRole[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'User does not have the required role to perform this action.',
      );
    }
  }

  private mapToReadDTO(supplier: SupplierWithDetails): SupplierReadDTO {
    return {
      id: supplier.id,
      userId: supplier.userId,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      contactEmail: supplier.contactEmail,
      contactPhone: supplier.contactPhone,
      city: supplier.city,
      country: supplier.country,
      fullAddress: supplier.fullAddress,
      description: supplier.description,
      status: supplier.status,
      reliabilityRating: supplier.reliabilityRating,
      leadTime: supplier.leadTime,
      materials: supplier.materials.map(
        (m) =>
          ({
            id: m.id,
            name: m.name,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          }) as SupplierMaterialReadDTO,
      ),
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    };
  }

  async create(
    userId: string,
    dto: SupplierCreateDTO,
  ): Promise<SupplierReadDTO> {
    await this.validateUserRole(userId, [
      UserRole.manufacturer,
      UserRole.admin,
    ]);

    try {
      const newSupplier = await this.prisma.supplier.create({
        data: {
          user: { connect: { id: userId } },
          name: dto.name,
          contactPerson: dto.contactPerson,
          contactEmail: dto.contactEmail,
          contactPhone: dto.contactPhone,
          city: dto.city,
          country: dto.country,
          fullAddress: dto.fullAddress,
          description: dto.description,
          status: dto.status,
          reliabilityRating: dto.reliabilityRating,
          leadTime: dto.leadTime,
          materials: dto.materials
            ? {
                create: dto.materials.map((m) => ({ name: m.name })),
              }
            : undefined,
        },
        include: {
          materials: true,
        },
      });
      return this.mapToReadDTO(newSupplier as SupplierWithDetails);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target as string[];
        if (target?.includes('userId') && target?.includes('name')) {
          throw new ConflictException(
            `Supplier with name '${dto.name}' already exists for this user.`,
          );
        }
      }
      this.logger.error(
        `Failed to create supplier: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Could not create supplier.');
    }
  }

  async findAll(
    userId: string,
    query: SupplierQueryDTO,
  ): Promise<SupplierReadDTO[]> {
    const where: Prisma.SupplierWhereInput = {
      userId: userId,
      ...(query.name && {
        name: { contains: query.name, mode: 'insensitive' },
      }),

      ...(query.status && { status: query.status }),
      ...(query.city && {
        city: { contains: query.city, mode: 'insensitive' },
      }),
      ...(query.country && {
        country: { contains: query.country, mode: 'insensitive' },
      }),
      ...(query.contactPerson && {
        contactPerson: { contains: query.contactPerson, mode: 'insensitive' },
      }),
    };

    const suppliers = await this.prisma.supplier.findMany({
      where,
      include: {
        materials: true,
      },
      orderBy: query.orderBy
        ? { [query.orderBy]: query.orderDirection || 'asc' }
        : { createdAt: 'desc' },
      skip: query.offset,
      take: query.limit,
    });
    return suppliers.map((s) => this.mapToReadDTO(s as SupplierWithDetails));
  }

  async findOne(userId: string, supplierId: string): Promise<SupplierReadDTO> {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, userId: userId },
      include: {
        materials: true,
      },
    });

    if (!supplier) {
      throw new NotFoundException(
        `Supplier with ID ${supplierId} not found or access denied.`,
      );
    }
    return this.mapToReadDTO(supplier as SupplierWithDetails);
  }

  async update(
    userId: string,
    supplierId: string,
    dto: SupplierUpdateDTO,
  ): Promise<SupplierReadDTO> {
    const existingSupplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, userId: userId },
    });

    if (!existingSupplier) {
      throw new NotFoundException(
        `Supplier with ID ${supplierId} not found or access denied.`,
      );
    }

    try {
      const updatedSupplier = await this.prisma.$transaction(async (tx) => {
        if (dto.deleteMaterialIds && dto.deleteMaterialIds.length > 0) {
          await tx.supplierMaterial.deleteMany({
            where: {
              id: { in: dto.deleteMaterialIds },
              supplierId: supplierId,
            },
          });
        }

        if (dto.updateMaterials && dto.updateMaterials.length > 0) {
          for (const mat of dto.updateMaterials) {
            await tx.supplierMaterial.update({
              where: { id: mat.id, supplierId: supplierId },
              data: { name: mat.name },
            });
          }
        }

        if (dto.createMaterials && dto.createMaterials.length > 0) {
          await tx.supplier.update({
            where: { id: supplierId },
            data: {
              materials: {
                create: dto.createMaterials.map((m) => ({ name: m.name })),
              },
            },
          });
        }

        return tx.supplier.update({
          where: { id: supplierId },
          data: {
            name: dto.name,
            contactPerson: dto.contactPerson,
            contactEmail: dto.contactEmail,
            contactPhone: dto.contactPhone,
            city: dto.city,
            country: dto.country,
            fullAddress: dto.fullAddress,
            description: dto.description,
            status: dto.status,
            reliabilityRating: dto.reliabilityRating,
            leadTime: dto.leadTime,
          },
          include: {
            materials: true,
          },
        });
      });
      return this.mapToReadDTO(updatedSupplier as SupplierWithDetails);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target as string[];
        if (target?.includes('userId') && target?.includes('name')) {
          throw new ConflictException(
            `Supplier with name '${dto.name}' already exists for this user.`,
          );
        }
        if (target?.includes('supplierId') && target?.includes('name')) {
          throw new ConflictException(
            `A material with the same name already exists for this supplier.`,
          );
        }
      }
      this.logger.error(
        `Failed to update supplier ${supplierId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Could not update supplier.');
    }
  }

  async remove(userId: string, supplierId: string): Promise<void> {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, userId: userId },
    });

    if (!supplier) {
      throw new NotFoundException(
        `Supplier with ID ${supplierId} not found or access denied.`,
      );
    }

    await this.prisma.supplier.delete({ where: { id: supplierId } });
  }
}
