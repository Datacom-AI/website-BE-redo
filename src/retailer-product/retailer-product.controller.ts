import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RetailerProductService } from './retailer-product.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from 'generated/prisma';
import { RetailerProductCreateDTO } from 'src/common/DTO/retailerProduct/retailerProduct.Create.dto';
import { RetailerProductUpdateDTO } from 'src/common/DTO/retailerProduct/retailerProduct.Update.dto';
import { RetailerProductReadDTO } from 'src/common/DTO/retailerProduct/retailerProduct.Read.dto';

@ApiTags('Retailer Products')
@ApiBearerAuth()
@Controller('retailer-product')
@UseGuards(JwtAuthGuard, RoleGuard)
export class RetailerProductController {
  constructor(
    private readonly retailerProductService: RetailerProductService,
  ) {}

  @Post()
  @Roles(UserRole.retailer, UserRole.admin)
  @ApiOperation({ summary: 'Create a new retailer product' })
  @ApiResponse({
    status: 201,
    description: 'Retailer product created successfully.',
    type: RetailerProductReadDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Not Found (e.g., Category or Retailer Profile).',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., SKU already exists).',
  })
  async create(
    @Request() req,
    @Body() dto: RetailerProductCreateDTO,
  ): Promise<RetailerProductReadDTO> {
    return this.retailerProductService.create(dto, req.user);
  }

  @Get('by-retailer-profile/:retailerProfileId')
  @Roles(UserRole.retailer, UserRole.admin)
  @ApiOperation({ summary: 'Get all products for a specific retailer profile' })
  @ApiParam({
    name: 'retailerProfileId',
    description: 'Retailer Profile ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of retailer products for the profile.',
    type: [RetailerProductReadDTO],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Retailer Profile not found.' })
  async findAllByRetailerProfile(
    @Request() req,
    @Param('retailerProfileId', ParseUUIDPipe) retailerProfileId: string,
  ): Promise<RetailerProductReadDTO[]> {
    return this.retailerProductService.findAllByRetailerProfileId(
      retailerProfileId,
      req.user,
    );
  }

  @Get(':id')
  @Roles(UserRole.retailer, UserRole.admin)
  @ApiOperation({ summary: 'Get a specific retailer product by ID' })
  @ApiParam({
    name: 'id',
    description: 'Retailer Product ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Retailer product details.',
    type: RetailerProductReadDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Retailer Product not found.' })
  async findOne(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RetailerProductReadDTO> {
    return this.retailerProductService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.retailer, UserRole.admin)
  @ApiOperation({ summary: 'Update a retailer product' })
  @ApiParam({
    name: 'id',
    description: 'Retailer Product ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Retailer product updated successfully.',
    type: RetailerProductReadDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Not Found (e.g., Product or Category).',
  })
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RetailerProductUpdateDTO,
  ): Promise<RetailerProductReadDTO> {
    return this.retailerProductService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.retailer, UserRole.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a retailer product' })
  @ApiParam({
    name: 'id',
    description: 'Retailer Product ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Retailer product deleted successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Retailer Product not found.' })
  async remove(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.retailerProductService.remove(id, req.user);
  }
}
