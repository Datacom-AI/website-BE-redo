import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { OrderCreateDTO } from 'src/common/DTO/order/order.Create.dto';
import { OrderBuyerUpdateDTO } from 'src/common/DTO/order/order.buyer.Update.dto';
import { OrderQueryDTO } from 'src/common/DTO/order/order.query.dto';
import {
  Order,
  Prisma,
  UserRole,
  NotificationType,
  OrderStatus,
  CatalogProduct,
  Profile,
  ManufacturerDetails,
} from 'generated/prisma';
import { stdout } from 'process';

type ProductWithSeller = CatalogProduct & {
  manufacturerDetails: ManufacturerDetails & {
    profile: Profile;
  };
};

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(OrderService.name);

  private async getProductAndSeller(
    productId: string,
  ): Promise<ProductWithSeller> {
    const product = await this.prisma.catalogProduct.findUnique({
      where: { id: productId },
      include: { manufacturerDetails: { include: { profile: true } } },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }
    if (!product.manufacturerDetails?.profile?.userId) {
      throw new BadRequestException(
        `Product with ID ${productId} does not have a valid seller.`,
      );
    }
    return product as ProductWithSeller;
  }

  async createOrder(buyerId: string, dto: OrderCreateDTO): Promise<Order> {
    const product = await this.getProductAndSeller(dto.productId);

    if (product.stockLevel < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${product.name}. Available: ${product.stockLevel}, Requested: ${dto.quantity}`,
      );
    }

    if (dto.quantity < (product.minimumOrderQuantity || 1)) {
      throw new BadRequestException(
        `Quantity below minimum order requirement: ${product.minimumOrderQuantity || 1}`,
      );
    }

    const totalPrice = product.pricePerUnit * dto.quantity;
    const sellerId = product.manufacturerDetails.profile.userId;

    try {
      const order = await this.prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId: buyerId,
            productId: dto.productId,
            quantity: dto.quantity,
            totalPrice,
            status: OrderStatus.pending,
          },
        });

        await tx.catalogProduct.update({
          where: { id: dto.productId },
          data: {
            stockLevel: {
              decrement: dto.quantity,
            },
          },
        });

        await tx.notification.create({
          data: {
            userId: sellerId,
            type: NotificationType.new_order_placed_for_seller,
            message: `New order (#${newOrder.id.substring(0, 8)}) received for product: ${product.name} from buyer ID ${buyerId}.`,
            relatedId: newOrder.id,
          },
        });
        this.logger.log(
          `New order ${newOrder.id} created by user ${buyerId} for product ${dto.productId}`,
        );
        return newOrder;
      });
      return order;
    } catch (error) {
      this.logger.error(
        `Error creating order for user ${buyerId}: ${error.message}`,
        error.stack,
      );

      throw new BadRequestException('Could not create order.');
    }
  }

  async sellerRespondToOrder(
    sellerId: string,
    orderId: string,
    action: 'accept' | 'reject',
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: { manufacturerDetails: { include: { profile: true } } },
        },
        user: true,
      },
    });

    if (!order)
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    if (order.product.manufacturerDetails?.profile?.userId !== sellerId) {
      throw new ForbiddenException(
        'You are not authorized to respond to this order.',
      );
    }
    if (order.status !== OrderStatus.pending) {
      throw new BadRequestException(
        `Order is not pending and cannot be responded to in this way. Current status: ${order.status}`,
      );
    }

    const newStatus =
      action === 'accept' ? OrderStatus.accepted : OrderStatus.rejected;

    try {
      const updatedOrder = await this.prisma.$transaction(async (tx) => {
        if (action === 'reject') {
          await tx.catalogProduct.update({
            where: { id: order.productId },
            data: { stockLevel: { increment: order.quantity } },
          });
          this.logger.log(
            `Stock replenished for product ${order.productId} due to rejection of order ${order.id}`,
          );
        }
        const updated = await tx.order.update({
          where: { id: orderId },
          data: { status: newStatus },
        });

        const notificationType =
          action === 'accept'
            ? NotificationType.order_accepted_by_seller_for_buyer
            : NotificationType.order_rejected_by_seller_for_buyer;

        await tx.notification.create({
          data: {
            userId: order.userId,
            type: notificationType,
            message: `Your order (#${order.id.substring(0, 8)}) for ${order.product.name} has been ${action}ed by the seller.`,
            relatedId: order.id,
          },
        });

        return updated;
      });
      this.logger.log(
        `Order ${order.id} ${action}ed by seller ${sellerId}. Status updated to ${newStatus}.`,
      );

      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Error updating order ${orderId} status to ${newStatus} by seller ${sellerId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Could not update order status.');
    }
  }

  async updateOrderStatusBySeller(
    sellerId: string,
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: { manufacturerDetails: { include: { profile: true } } },
        },
        user: true,
      },
    });

    if (!order)
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    if (order.product.manufacturerDetails?.profile?.userId !== sellerId) {
      throw new ForbiddenException(
        'You are not authorized to update this order status.',
      );
    }

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: [
        OrderStatus.accepted,
        OrderStatus.rejected,
        OrderStatus.cancelled,
      ],
      accepted: [OrderStatus.processing, OrderStatus.cancelled],
      processing: [OrderStatus.shipped, OrderStatus.cancelled],
      shipped: [OrderStatus.completed, OrderStatus.cancelled],
      completed: [],
      rejected: [],
      cancelled: [],
    };

    if (
      order.status === OrderStatus.completed ||
      order.status === OrderStatus.cancelled ||
      order.status === OrderStatus.rejected
    ) {
      throw new BadRequestException(
        `Order is already ${order.status} and cannot be updated further by seller.`,
      );
    }
    if (!allowedTransitions[order.status]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition order from ${order.status} to ${newStatus}.`,
      );
    }

    try {
      const updatedOrder = await this.prisma.$transaction(async (tx) => {
        if (newStatus === OrderStatus.cancelled) {
          if (
            order.status === OrderStatus.accepted ||
            order.status === OrderStatus.processing ||
            order.status === OrderStatus.shipped
          ) {
            await tx.catalogProduct.update({
              where: { id: order.productId },
              data: { stockLevel: { increment: order.quantity } },
            });
            this.logger.log(
              `Stock replenished for product ${order.productId} due to seller cancellation of order ${order.id}`,
            );
          }
        }
        const updated = await tx.order.update({
          where: { id: orderId },
          data: { status: newStatus },
        });

        const notificationType =
          newStatus === OrderStatus.cancelled
            ? NotificationType.order_cancelled_by_seller_for_buyer
            : NotificationType.order_status_updated_by_seller_for_buyer;

        await tx.notification.create({
          data: {
            userId: order.userId,
            type: notificationType,
            message: `The status of your order (#${order.id.substring(0, 8)}) for ${order.product.name} has been updated to ${newStatus}.`,
            relatedId: order.id,
          },
        });

        return updated;
      });

      this.logger.log(
        `Order ${order.id} status updated to ${newStatus} by seller ${sellerId}.`,
      );

      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Error updating stock level for product ${order.productId} during order cancellation: ${error.message}`,
        error.stack,
      );

      throw new BadRequestException('Could not update order status.');
    }
  }

  async updateOrderByBuyer(
    buyerId: string,
    orderId: string,
    dto: OrderBuyerUpdateDTO,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });
    if (!order)
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    if (order.userId !== buyerId) {
      throw new ForbiddenException(
        'You are not authorized to update this order.',
      );
    }
    if (
      order.status !== OrderStatus.pending &&
      order.status !== OrderStatus.accepted
    ) {
      throw new BadRequestException(
        `Order cannot be updated by buyer as it is already ${order.status}.`,
      );
    }

    let stockUpdate = {};
    let totalPriceUpdate = {};
    if (dto.quantity && dto.quantity !== order.quantity) {
      const stockDifference = dto.quantity - order.quantity;

      if (stockDifference > order.product.stockLevel) {
        throw new BadRequestException(
          `Insufficient stock for product ${order.product.name}. Available: ${order.product.stockLevel}, Requested: ${dto.quantity}`,
        );
      }

      if (dto.quantity < (order.product.minimumOrderQuantity || 1)) {
        throw new BadRequestException(
          `Quantity below minimum order requirement: ${order.product.minimumOrderQuantity || 1}`,
        );
      }

      stockUpdate = { stockLevel: { decrement: stockDifference } };
      totalPriceUpdate = {
        totalPrice: order.product.pricePerUnit * dto.quantity,
      };
    }

    try {
      const updatedOrder = await this.prisma.$transaction(async (tx) => {
        if (dto.quantity && dto.quantity !== order.quantity) {
          await tx.catalogProduct.update({
            where: { id: order.productId },
            data: stockUpdate,
          });
        }

        return tx.order.update({
          where: { id: orderId },
          data: {
            shippingNotes: dto.shippingNotes,
            quantity: dto.quantity,
            ...totalPriceUpdate,
          },
        });
      });

      this.logger.log(`Order ${order.id} updated by buyer ${buyerId}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Error updating order ${orderId} by buyer ${buyerId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Could not update order.');
    }
  }

  async getOrderByIdForUser(
    orderId: string,
    requestingUserId: string,
    userRole: UserRole,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: {
          include: {
            manufacturerDetails: {
              include: { profile: { select: { userId: true } } },
            },
            productCategory: true,
          },
        },
      },
    });

    if (!order)
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    const sellerId = order.product.manufacturerDetails?.profile?.userId;

    if (
      userRole === UserRole.admin ||
      order.userId === requestingUserId ||
      sellerId === requestingUserId
    ) {
      return order;
    }
    throw new ForbiddenException('You are not authorized to view this order.');
  }

  async getOrdersForUser(
    userId: string,
    query: OrderQueryDTO,
  ): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        userId,
        status: query.status,
        createdAt: {
          gte: query.createdAtFrom,
          lte: query.createdAtTo,
        },
      },
      include: {
        product: { select: { id: true, name: true, image: true } },
      },
      orderBy: {
        [query.orderBy || 'createdAt']: query.orderDirection || 'desc',
      },
      skip: query.offset,
      take: query.limit,
    });
  }

  async getOrdersForSeller(
    sellerId: string,
    query: OrderQueryDTO,
  ): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        product: {
          manufacturerDetails: {
            profile: {
              userId: sellerId,
            },
          },
        },
        status: query.status,
        createdAt: {
          gte: query.createdAtFrom,
          lte: query.createdAtTo,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, image: true } },
      },
      orderBy: {
        [query.orderBy || 'createdAt']: query.orderDirection || 'desc',
      },
      skip: query.offset,
      take: query.limit,
    });
  }

  async cancelOrderByBuyer(buyerId: string, orderId: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: { manufacturerDetails: { include: { profile: true } } },
        },
      },
    });

    if (!order)
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    if (order.userId !== buyerId) {
      throw new ForbiddenException(
        'You are not authorized to cancel this order.',
      );
    }
    if (
      order.status !== OrderStatus.pending &&
      order.status !== OrderStatus.accepted
    ) {
      throw new BadRequestException(
        `Order cannot be cancelled by buyer as it is already ${order.status}.`,
      );
    }

    const sellerId = order.product.manufacturerDetails?.profile?.userId;

    try {
      const cancelledOrder = await this.prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.cancelled },
        });

        await tx.catalogProduct.update({
          where: { id: order.productId },
          data: { stockLevel: { increment: order.quantity } },
        });

        if (sellerId) {
          await tx.notification.create({
            data: {
              userId: sellerId,
              type: NotificationType.order_cancelled_by_buyer_for_seller,
              message: `Order (#${order.id.substring(0, 8)}) for product ${order.product.name} has been cancelled by the buyer.`,
              relatedId: order.id,
            },
          });
        }
        this.logger.log(
          `Order ${order.id} cancelled by buyer ${buyerId}. Status set to cancelled.`,
        );
        return updatedOrder;
      });
      return cancelledOrder;
    } catch (error) {
      this.logger.error(
        `Error cancelling order ${orderId} by buyer ${buyerId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Could not cancel order.');
    }
  }

  async hardDeleteOrderByAdmin(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: { manufacturerDetails: { include: { profile: true } } },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    const terminalOrderStatuses: OrderStatus[] = [
      OrderStatus.cancelled,
      OrderStatus.completed,
      OrderStatus.rejected,
    ];
    const sellerId = order.product.manufacturerDetails?.profile?.userId;

    try {
      await this.prisma.$transaction(async (tx) => {
        if (!terminalOrderStatuses.includes(order.status)) {
          await tx.catalogProduct.update({
            where: { id: order.productId },
            data: { stockLevel: { increment: order.quantity } },
          });
          this.logger.log(
            `Stock replenished for product ${order.productId} due to admin deletion of order ${order.id}`,
          );
        }

        await tx.notification.create({
          data: {
            userId: sellerId,
            type: NotificationType.order_deleted_by_admin,
            message: `Order (#${order.id.substring(0, 8)}) involving your product has been deleted by an administrator.`,
            relatedId: orderId,
          },
        });

        if (sellerId && sellerId !== order.userId) {
          await tx.notification.create({
            data: {
              userId: sellerId,
              type: NotificationType.order_deleted_by_admin,
              message: `Order (#${order.id.substring(0, 8)}) involving your product has been deleted by an administrator.`,
              relatedId: orderId,
            },
          });
        }

        await tx.order.delete({ where: { id: orderId } });
      });

      this.logger.log(`Order ${orderId} hard deleted by admin.`);
    } catch (error) {
      this.logger.error(
        `Error hard deleting order ${orderId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Could not hard delete order.');
    }
  }
}
