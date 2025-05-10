import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Partnership,
  PartnershipStatus,
  PartnershipType,
  User,
  UserRole,
} from 'generated/prisma';
import { PartnershipCreateDTO } from 'src/common/DTO/partnership/partnership.Create.dto';
import { PartnershipUpdateDTO } from 'src/common/DTO/partnership/partnership.Update.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PartnershipService {
  private readonly logger = new Logger(PartnershipService.name);

  constructor(private prisma: PrismaService) {
    this.logger.log('PartnershipService initialized');
  }

  private async getUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
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
      manufacturer_manufacturer: [
        [UserRole.manufacturer, UserRole.manufacturer],
      ],
      retailer_retailer: [[UserRole.retailer, UserRole.retailer]],
      brand_brand: [[UserRole.brand, UserRole.brand]],
    };

    return validateCombinations[type].some(
      ([role1, role2]) =>
        (userRole === role1 && partnerRole === role2) ||
        (userRole === role2 && partnerRole === role1),
    );
  }

  async createPartnershipRequestService(
    requesterId: string,
    dto: PartnershipCreateDTO,
  ): Promise<Partnership> {
    const requester = await this.getUser(requesterId);
    const partner = await this.getUser(dto.userTwoId);

    if (requesterId === dto.userTwoId) {
      throw new BadRequestException('Cannot create partnership with self');
    }

    // validate partnership type based on user roles
    const validPartnership = this.validatePartnershipType(
      requester.role,
      partner.role,
      dto.type,
    );

    if (!validPartnership) {
      throw new BadRequestException(
        `Invalid partnership type ${dto.type} for roles ${requester.role} and ${partner.role}`,
      );
    }

    const existingPartnership = await this.prisma.partnership.findFirst({
      where: {
        OR: [
          { userOneId: requesterId, userTwoId: dto.userTwoId },
          { userOneId: dto.userTwoId, userTwoId: requesterId },
        ],
        status: { in: [PartnershipStatus.pending, PartnershipStatus.accepted] },
      },
    });

    if (existingPartnership) {
      if (existingPartnership.status === PartnershipStatus.pending) {
        throw new BadRequestException(
          'A pending partnership request already exists between these users.',
        );
      }

      if (existingPartnership.status === PartnershipStatus.accepted) {
        throw new BadRequestException(
          'An active partnership already exists between these users.',
        );
      }
    }

    try {
      const partnershipRequest = await this.prisma.partnership.create({
        data: {
          userOneId: requesterId,
          userTwoId: dto.userTwoId,
          requestedById: requesterId,
          type: dto.type,
          status: PartnershipStatus.pending,
          isActive: false,
          partnershipType: dto.partnershipType,
          agreementDetails: dto.agreementDetails,
          creditTerms: dto.creditTerms,
          minimumOrderRequirements: dto.minimumOrderRequirements,
          notes: dto.notes,
          partnershipTier: dto.partnershipTier,
          endDate: dto.endDate,
        },
        include: {
          userOne: { select: { name: true, email: true, role: true } },
          userTwo: { select: { name: true, email: true, role: true } },
          requestedBy: { select: { name: true, email: true, role: true } },
        },
      });

      // create notification for the userTwo
      await this.prisma.notification.create({
        data: {
          userId: dto.userTwoId,
          type: 'partnership_update',
          message: `New partnership request from ${requester.name}`,
          relatedId: partnershipRequest.id,
        },
      });

      return partnershipRequest;
    } catch (error) {
      this.logger.error('Error creating partnership', error);
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'A partnership or request already exists.',
        );
      }
      throw new BadRequestException('Error creating partnership');
    }
  }

  async respondToPartnershipRequestService(
    responderId: string,
    partnershipId: string,
    action: 'accept' | 'decline',
  ): Promise<Partnership> {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id: partnershipId },
      include: {
        userOne: { select: { name: true } },
      },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (partnership.userTwoId !== responderId) {
      throw new BadRequestException(
        'You are not authorized to respond to this partnership request',
      );
    }

    if (partnership.status !== PartnershipStatus.pending) {
      throw new BadRequestException(
        `Partnership request is already ${partnership.status.toLowerCase()}`,
      );
    }

    const newStatus =
      action === 'accept'
        ? PartnershipStatus.accepted
        : PartnershipStatus.declined;

    const isActive = action === 'accept' ? true : false;
    const startDate = action === 'accept' ? new Date() : null;

    const updatedPartnership = await this.prisma.partnership.update({
      where: { id: partnershipId },
      data: {
        status: newStatus,
        isActive,
        startDate,
      },
      include: {
        userOne: { select: { name: true, email: true, role: true } },
        userTwo: { select: { name: true, email: true, role: true } },
      },
    });

    const responder = await this.getUser(responderId);
    const notificationType =
      action === 'accept'
        ? 'partnership_request_accepted'
        : 'partnership_request_declined';

    const message =
      action === 'accept'
        ? `Your partnership request has been accepted by ${responder.name}`
        : `Your partnership request has been declined by ${responder.name}`;

    await this.prisma.notification.create({
      data: {
        userId: partnership.userOneId,
        type: notificationType,
        message: message,
        relatedId: partnership.id,
      },
    });

    return updatedPartnership;
  }

  async cancelPartnershipRequestService(
    requesterId: string,
    partnershipId: string,
  ): Promise<Partnership> {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id: partnershipId },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (partnership.requestedById !== requesterId) {
      throw new BadRequestException(
        'You are not authorized to cancel this partnership request',
      );
    }

    if (partnership.status !== PartnershipStatus.pending) {
      throw new BadRequestException(
        `Partnership request is already ${partnership.status.toLowerCase()}`,
      );
    }

    const updatedPartnership = await this.prisma.partnership.update({
      where: { id: partnershipId },
      data: {
        status: PartnershipStatus.cancelled,
        isActive: false,
      },
    });

    return updatedPartnership;
  }

  async updatePartnershipService(
    userId: string, // user performs update
    partnershipId: string,
    dto: PartnershipUpdateDTO,
  ): Promise<Partnership> {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id: partnershipId },
      include: { userOne: true, userTwo: true },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (partnership.userOneId !== userId && partnership.userTwoId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this partnership',
      );
    }

    // if updating type, validate the roles
    if (dto.type && dto.type !== partnership.type) {
      const userOneRole = partnership.userOne.role;
      const userTwoRole = partnership.userTwo.role;
      const validPartnershipType = this.validatePartnershipType(
        userOneRole,
        userTwoRole,
        dto.type,
      );

      if (!validPartnershipType) {
        throw new BadRequestException(
          `Invalid partnership type ${dto.type} for roles ${userOneRole} and ${userTwoRole}`,
        );
      }
    }

    try {
      const updatedPartnership = await this.prisma.partnership.update({
        where: { id: partnershipId },
        data: {
          partnershipType: dto.partnershipType,
          agreementDetails: dto.agreementDetails,
          creditTerms: dto.creditTerms,
          minimumOrderRequirements: dto.minimumOrderRequirements,
          notes: dto.notes,
          partnershipTier: dto.partnershipTier,
          endDate: dto.endDate,
        },
        include: {
          userOne: { select: { name: true, email: true, role: true } },
          userTwo: { select: { name: true, email: true, role: true } },
        },
      });

      const currentUser = await this.getUser(userId);
      const otherUserId =
        partnership.userOneId === userId
          ? partnership.userTwoId
          : partnership.userOneId;

      await this.prisma.notification.create({
        data: {
          userId: otherUserId,
          type: 'partnership_update',
          message: `Your partnership with ${currentUser.name} has been updated.`,
          relatedId: partnership.id,
        },
      });

      return updatedPartnership;
    } catch (error) {
      this.logger.error('Error updating partnership', error);
      throw new BadRequestException('Error updating partnership');
    }
  }

  async getPartnershipsService(
    userId: string,
    status?: PartnershipStatus,
  ): Promise<Partnership[]> {
    await this.getUser(userId);

    const whereClause: any = {
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    };

    if (status) {
      whereClause.status = status;
    } else {
      whereClause.status = {
        in: [PartnershipStatus.accepted, PartnershipStatus.pending],
      };
    }

    return this.prisma.partnership.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        userOne: { select: { name: true, email: true, role: true } },
        userTwo: { select: { name: true, email: true, role: true } },
        requestedBy: { select: { id: true, name: true } },
      },
    });
  }

  async getPartnershipByIdService(
    userId: string,
    partnershipId: string,
  ): Promise<Partnership> {
    await this.getUser(userId);

    const partnership = await this.prisma.partnership.findUnique({
      where: { id: partnershipId },
      include: {
        userOne: { select: { name: true, email: true, role: true } },
        userTwo: { select: { name: true, email: true, role: true } },
        requestedBy: { select: { id: true, name: true } },
      },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (partnership.userOneId !== userId && partnership.userTwoId !== userId) {
      throw new BadRequestException(
        'You are not authorized to view this partnership',
      );
    }

    return partnership;
  }

  async terminatePartnershipService(userId: string, partnershipId: string) {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id: partnershipId },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (partnership.userOneId !== userId && partnership.userTwoId !== userId) {
      throw new BadRequestException(
        'You are not authorized to terminate this partnership',
      );
    }

    if (partnership.status !== PartnershipStatus.accepted) {
      throw new BadRequestException(
        'Only active (accepted) partnerships can be terminated.',
      );
    }

    try {
      const terminatedPartnership = await this.prisma.partnership.update({
        where: { id: partnershipId },
        data: {
          status: PartnershipStatus.terminated,
          isActive: false,
          endDate: new Date(),
        },
      });

      const currentUser = await this.getUser(userId);
      const otherUserId =
        partnership.userOneId === userId
          ? partnership.userTwoId
          : partnership.userOneId;

      await this.prisma.notification.create({
        data: {
          userId: otherUserId,
          type: 'partnership_terminated',
          message: `Your partnership with ${currentUser.name} has been terminated.`,
          relatedId: partnership.id,
        },
      });

      return terminatedPartnership;
    } catch (error) {
      this.logger.error('Error terminating partnership', error);
      throw new BadRequestException('Error terminating partnership');
    }
  }

  // ADMIN ONLY
  async deletePartnershipService(
    adminUserId: string,
    partnershipId: string,
  ): Promise<void> {
    const adminUser = await this.getUser(adminUserId);

    this.logger.log(
      `Admin user ${adminUser.name} is attempting to delete partnership ${partnershipId}`,
    );

    const partnership = await this.prisma.partnership.findUnique({
      where: { id: partnershipId },
      include: {
        userOne: { select: { id: true, name: true } },
        userTwo: { select: { id: true, name: true } },
      },
    });

    if (!partnership) {
      throw new NotFoundException(
        `Partnership with ID ${partnershipId} not found`,
      );
    }

    try {
      await this.prisma.partnership.delete({
        where: { id: partnershipId },
      });

      this.logger.log(
        `Partnership ${partnershipId} deleted successfully by admin ${adminUser.name}`,
      );

      const notificationMessage = `A partnership you were part of (ID: ${partnershipId}) has been deleted by admin ${adminUser.name}.`;

      if (partnership.userOneId) {
        await this.prisma.notification.create({
          data: {
            userId: partnership.userOneId,
            type: 'partnership_admin_deleted',
            message: notificationMessage,
            relatedId: partnershipId,
          },
        });
      }

      if (partnership.userTwoId) {
        await this.prisma.notification.create({
          data: {
            userId: partnership.userTwoId,
            type: 'partnership_admin_deleted',
            message: notificationMessage,
            relatedId: partnershipId,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Error deleting partnership ID: ${partnershipId} by admin ${adminUser.name}`,
        error,
      );
      throw new BadRequestException('Error deleting partnership');
    }
  }
}
