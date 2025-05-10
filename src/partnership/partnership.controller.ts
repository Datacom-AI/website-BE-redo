import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { PartnershipService } from './partnership.service';
import { PartnershipCreateDTO } from 'src/common/DTO/partnership/partnership.Create.dto';
import { Partnership, PartnershipStatus, UserRole } from 'generated/prisma';
import { PartnershipUpdateDTO } from 'src/common/DTO/partnership/partnership.Update.dto';

@ApiTags('partnership')
@ApiBearerAuth()
@Controller('partnership')
@UseGuards(JwtAuthGuard, RoleGuard)
export class PartnershipController {
  constructor(private partnershipService: PartnershipService) {}

  @Post('request')
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a partnership request' })
  @ApiResponse({
    status: 201,
    description: 'Partnership request created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createPartnershipRequest(
    @Request() req,
    @Body() dto: PartnershipCreateDTO,
  ): Promise<Partnership> {
    return await this.partnershipService.createPartnershipRequestService(
      req.user.id,
      dto,
    );
  }

  @Patch(':partnershipId/respond')
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @ApiOperation({ summary: 'Respond to a partnership request' })
  @ApiResponse({
    status: 200,
    description: 'Partnership request responded successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Partnership not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async respondToPartnershipRequest(
    @Request() req,
    @Param('partnershipId') partnershipId: string,
    @Body('action') action: 'accept' | 'decline',
  ): Promise<Partnership> {
    if (!action || (action !== 'accept' && action !== 'decline')) {
      throw new BadRequestException(
        "Invalid action. Use 'accept' or 'decline'.",
      );
    }
    return this.partnershipService.respondToPartnershipRequestService(
      req.user.id,
      partnershipId,
      action,
    );
  }

  @Patch(':partnershipId/cancel')
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @ApiOperation({
    summary: 'Cancel a pending partnership request (by initiator)',
  })
  @ApiResponse({
    status: 200,
    description: 'Partnership request cancelled successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async cancelPartnershipRequest(
    @Request() req,
    @Param('partnershipId') partnershipId: string,
  ): Promise<Partnership> {
    return this.partnershipService.cancelPartnershipRequestService(
      req.user.id, // requester's ID
      partnershipId,
    );
  }

  @Patch(':partnershipId')
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @ApiOperation({ summary: 'Update an active partnership' })
  @ApiResponse({
    status: 200,
    description: 'Partnership updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async updatePartnership(
    @Request() req,
    @Param('partnershipId') partnershipId: string,
    @Body() dto: PartnershipUpdateDTO,
  ): Promise<Partnership> {
    return this.partnershipService.updatePartnershipService(
      req.user.id,
      partnershipId,
      dto,
    );
  }

  @Get()
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @ApiOperation({ summary: 'Get all partnerships for the current user' })
  @ApiResponse({ status: 200, description: 'List of partnerships.' })
  async getMyPartnerships(
    @Request() req,
    @Query('status') status?: PartnershipStatus,
  ): Promise<Partnership[]> {
    return this.partnershipService.getPartnershipsService(req.user.id, status);
  }

  @Get(':partnershipId')
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @ApiOperation({ summary: 'Get a specific partnership by ID' })
  @ApiResponse({ status: 200, description: 'Partnership details.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async getPartnershipById(
    @Request() req,
    @Param('partnershipId') partnershipId: string,
  ): Promise<Partnership> {
    return this.partnershipService.getPartnershipByIdService(
      req.user.id,
      partnershipId,
    );
  }

  @Patch(':partnershipId/terminate')
  @Roles(UserRole.manufacturer, UserRole.brand, UserRole.retailer)
  @ApiOperation({ summary: 'Terminate an active partnership' })
  @ApiResponse({
    status: 200,
    description: 'Partnership terminated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async terminatePartnership(
    @Request() req,
    @Param('partnershipId') partnershipId: string,
  ): Promise<Partnership> {
    return this.partnershipService.terminatePartnershipService(
      req.user.id,
      partnershipId,
    );
  }

  @Delete(':partnershipId/admin')
  @Roles(UserRole.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ADMIN: Hard delete a partnership' })
  @ApiResponse({ status: 204, description: 'Partnership deleted by admin.' })
  @ApiResponse({ status: 403, description: 'Forbidden (not an admin).' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async deletePartnershipByAdmin(
    @Request() req,
    @Param('partnershipId') partnershipId: string,
  ): Promise<void> {
    return this.partnershipService.deletePartnershipService(
      req.user.id, // admin ID
      partnershipId,
    );
  }
}
