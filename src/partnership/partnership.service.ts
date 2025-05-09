import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Partnership, PartnershipType, UserRole } from 'generated/prisma';
import { PartnershipCreateDTO } from 'src/common/DTO/partnership/partnership.Create.dto';
import { PartnershipUpdateDTO } from 'src/common/DTO/partnership/partnership.Update.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PartnershipService {
  private readonly logger = new Logger(PartnershipService.name);

  constructor(private prisma: PrismaService) {
    this.logger.log('PartnershipService initialized');
  }

  private validatePartnershipType(
    userRole: UserRole,
    partnerRole: UserRole,
    type: PartnershipType,
  ): boolean {
    const validateCombinations: Record<
      PartnershipType,
      [UserRole, UserRole][]
    > = {
      retailer_brand: [
        [UserRole.retailer, UserRole.brand],
        [UserRole.brand, UserRole.retailer],
      ],
      manufacturer_brand: [
        [UserRole.manufacturer, UserRole.brand],
        [UserRole.brand, UserRole.manufacturer],
      ],
      manufacturer_retailer: [
        [UserRole.manufacturer, UserRole.retailer],
        [UserRole.retailer, UserRole.manufacturer],
      ],
    };

    return validateCombinations[type].some(
      ([role1, role2]) =>
        (userRole === role1 && partnerRole === role2) ||
        (userRole === role2 && partnerRole === role1),
    );
  }

  async createPartnershipService(
    userId: string,
    dto: PartnershipCreateDTO,
  ): Promise<Partnership> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userTwo = await this.prisma.user.findUnique({
      where: { id: dto.userTwoId, deletedAt: null },
    });

    if (!userTwo) {
      throw new NotFoundException('User two not found');
    }

    // validate partnership type based on user roles
    const validPartnership = this.validatePartnershipType(
      user.role,
      userTwo.role,
      dto.type,
    );

    if (!validPartnership) {
      throw new BadRequestException(
        `Invalid partnership type ${dto.type} for roles ${user.role} and ${userTwo.role}`,
      );
    }

    const existingPartnership = await this.prisma.partnership.findUnique({
      where: {
        userOneId_userTwoId: { userOneId: userId, userTwoId: dto.userTwoId },
      },
    });

    if (existingPartnership) {
      throw new BadRequestException('Partnership already exists');
    }

    try {
      const partnership = await this.prisma.partnership.create({
        data: {
          userOneId: userId,
          userTwoId: dto.userTwoId,
          type: dto.type,
          partnershipType: dto.partnershipType,
          agreementDetails: dto.agreementDetails,
          creditTerms: dto.creditTerms,
          minimumOrderRequirements: dto.minimumOrderRequirements,
          isActive: dto.isActive,
          notes: dto.notes,
          partnershipTier: dto.partnershipTier,
          startDate: dto.startDate,
          endDate: dto.endDate,
        },
        include: {
          userOne: { select: { name: true } },
          userTwo: { select: { name: true } },
        },
      });

      // create notification for the userTwo
      await this.prisma.notification.create({
        data: {
          userId: dto.userTwoId,
          type: 'partnership_update',
          message: `New partnership request from ${user.name}`,
        },
      });

      return partnership;
    } catch (error) {
      this.logger.error('Error creating partnership', error);
      throw new BadRequestException('Error creating partnership');
    }
  }

  async updatePartnershipService(
    userId: string,
    partnershipId: string,
    dto: PartnershipUpdateDTO,
  ): Promise<Partnership> {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id: partnershipId, deletedAt: null },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (partnership.userOneId !== userId && partnership.userTwoId !== userId) {
      throw new BadRequestException(
        'You are not authorized to update this partnership',
      );
    }

    // if updating type, validate the roles
    if (dto.type) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });

      const otherUserId =
        partnership.userOneId === userId
          ? partnership.userTwoId
          : partnership.userOneId;

      const otherUser = await this.prisma.user.findUnique({
        where: { id: otherUserId, deletedAt: null },
      });

      if (!user || !otherUser) {
        throw new NotFoundException('User not found');
      }

      const validPartnership = this.validatePartnershipType(
        user.role,
        otherUser.role,
        dto.type,
      );

      if (!validPartnership) {
        throw new BadRequestException(
          `Invalid partnership type ${dto.type} for roles ${user.role} and ${otherUser.role}`,
        );
      }
    }

    try {
      const updatedPartnership = await this.prisma.partnership.update({
        where: { id: partnershipId },
        data: {
          type: dto.type,
          partnershipType: dto.partnershipType,
          agreementDetails: dto.agreementDetails,
          creditTerms: dto.creditTerms,
          minimumOrderRequirements: dto.minimumOrderRequirements,
          isActive: dto.isActive,
          notes: dto.notes,
          partnershipTier: dto.partnershipTier,
          startDate: dto.startDate,
          endDate: dto.endDate,
        },
        include: {
          userOne: { select: { name: true } },
          userTwo: { select: { name: true } },
        },
      });

      // create notification for the other user
      const otherUserId =
        partnership.userOneId === userId
          ? partnership.userTwoId
          : partnership.userOneId;

      await this.prisma.notification.create({
        data: {
          userId: otherUserId,
          type: 'partnership_update',
          message: `Partnership updated by ${userId}`,
        },
      });

      return updatedPartnership;
    } catch (error) {
      this.logger.error('Error updating partnership', error);
      throw new BadRequestException('Error updating partnership');
    }
  }

  async getPartnershipsService(userId: string): Promise<Partnership[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.partnership.findMany({
      where: {
        deletedAt: null,
        OR: [{ userOneId: userId }, { userTwoId: userId }],
      },
      include: {
        userOne: { select: { name: true, role: true } },
        userTwo: { select: { name: true, role: true } },
      },
    });
  }

  async deletePartnershipService(
    userId: string,
    partnershipId: string,
  ): Promise<void> {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id: partnershipId, deletedAt: null },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (partnership.userOneId !== userId && partnership.userTwoId !== userId) {
      throw new BadRequestException(
        'You are not authorized to delete this partnership',
      );
    }

    try {
      // soft delete the partnership
      // await this.prisma.partnership.update({
      //   where: { id: partnershipId },
      //   data: { deletedAt: new Date() },
      // });

      // hard delete the partnership
      await this.prisma.partnership.delete({
        where: { id: partnershipId },
      });

      // create notification for the other user
      const otherUserId =
        partnership.userOneId === userId
          ? partnership.userTwoId
          : partnership.userOneId;

      await this.prisma.notification.create({
        data: {
          userId: otherUserId,
          type: 'partnership_update',
          message: `Partnership deleted by ${userId}`,
        },
      });
    } catch (error) {
      this.logger.error('Error deleting partnership', error);
      throw new BadRequestException('Error deleting partnership');
    }
  }
}
