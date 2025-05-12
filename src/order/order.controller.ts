import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderCreateDTO } from 'src/common/DTO/order/order.Create.dto';
import { OrderSellerResponseDTO } from 'src/common/DTO/order/order.sellerResponse.dto';
import { OrderStatusUpdateDTO } from 'src/common/DTO/order/order.status.Update.dto';
import { OrderBuyerUpdateDTO } from 'src/common/DTO/order/order.buyer.Update.dto';
import { OrderQueryDTO } from 'src/common/DTO/order/order.query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Order, UserRole } from 'generated/prisma';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RoleGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place a new order (by Buyer)' })
  @ApiResponse({ status: 201, description: 'Order created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., insufficient stock, invalid product).',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async createOrder(
    @Request() req,
    @Body() dto: OrderCreateDTO,
  ): Promise<Order> {
    return this.orderService.createOrder(req.user.id, dto);
  }

  @Patch('seller-response/:id')
  @Roles(UserRole.manufacturer)
  @ApiOperation({ summary: 'Seller accepts or rejects an order' })
  @ApiResponse({
    status: 200,
    description: 'Order response processed successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async sellerRespondToOrder(
    @Request() req,
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body() dto: OrderSellerResponseDTO,
  ): Promise<Order> {
    // if (!dto.action || !['accept', 'reject'].includes(dto.action)) {
    //   throw new BadRequestException(
    //     "Invalid action. Must be 'accept' or 'reject'.",
    //   );
    // }

    return this.orderService.sellerRespondToOrder(
      req.user.id,
      orderId,
      dto.action,
    );
  }

  @Patch('status/:id')
  @Roles(UserRole.manufacturer)
  @ApiOperation({
    summary:
      'Seller updates order status (e.g., processing, shipped, completed)',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., invalid status transition).',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async updateOrderStatusBySeller(
    @Request() req,
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body() dto: OrderStatusUpdateDTO,
  ): Promise<Order> {
    return this.orderService.updateOrderStatusBySeller(
      req.user.id,
      orderId,
      dto.status,
    );
  }

  @Patch('buyer-update/:id')
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @ApiOperation({
    summary:
      'Buyer updates their order (e.g., shipping notes before processing)',
  })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully by buyer.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., order already processed).',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async updateOrderByBuyer(
    @Request() req,
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body() dto: OrderBuyerUpdateDTO,
  ): Promise<Order> {
    return this.orderService.updateOrderByBuyer(req.user.id, orderId, dto);
  }

  @Get('my-orders')
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @ApiOperation({ summary: 'Get orders placed by the current user (Buyer)' })
  @ApiResponse({ status: 200, description: 'List of buyer orders.' })
  async getMyOrders(
    @Request() req,
    @Query() query: OrderQueryDTO,
  ): Promise<Order[]> {
    return this.orderService.getOrdersForUser(req.user.id, query);
  }

  @Get('seller-orders')
  @Roles(UserRole.manufacturer)
  @ApiOperation({ summary: 'Get orders received by the current user (Seller)' })
  @ApiResponse({ status: 200, description: 'List of seller orders.' })
  async getSellerOrders(
    @Request() req,
    @Query() query: OrderQueryDTO,
  ): Promise<Order[]> {
    return this.orderService.getOrdersForSeller(req.user.id, query);
  }

  @Get(':id')
  @Roles(
    UserRole.manufacturer,
    UserRole.brand,
    UserRole.retailer,
    UserRole.admin,
  )
  @ApiOperation({ summary: 'Get a specific order by ID' })
  @ApiResponse({ status: 200, description: 'Order details.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getOrderById(
    @Request() req,
    @Param('id', ParseUUIDPipe) orderId: string,
  ): Promise<Order> {
    return this.orderService.getOrderByIdForUser(
      orderId,
      req.user.id,
      req.user.role,
    );
  }

  @Patch('cancel-by-buyer/:id')
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @ApiOperation({ summary: 'Buyer cancels a pending order' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully by buyer.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., order not pending or already processed).',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async cancelOrderByBuyer(
    @Request() req,
    @Param('id', ParseUUIDPipe) orderId: string,
  ): Promise<Order> {
    return this.orderService.cancelOrderByBuyer(req.user.id, orderId);
  }

  @Delete('admin-hard-delete/:id')
  @Roles(UserRole.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ADMIN: Hard delete an order' })
  @ApiResponse({ status: 204, description: 'Order hard deleted by admin.' })
  @ApiResponse({ status: 403, description: 'Forbidden (not an admin).' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async hardDeleteOrderByAdmin(
    @Param('id', ParseUUIDPipe) orderId: string,
  ): Promise<void> {
    await this.orderService.hardDeleteOrderByAdmin(orderId);
  }
}
