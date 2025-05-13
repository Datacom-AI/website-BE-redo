import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierCreateDTO } from 'src/common/DTO/supplier/supplier.Create.dto';
import { SupplierUpdateDTO } from 'src/common/DTO/supplier/supplier.Update.dto';
import { SupplierReadDTO } from 'src/common/DTO/supplier/supplier.Read.dto';
import { SupplierQueryDTO } from 'src/common/DTO/supplier/supplier.query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from 'generated/prisma';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @Roles(UserRole.manufacturer, UserRole.admin)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({
    status: 201,
    description: 'Supplier created successfully.',
    type: SupplierReadDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden (User role not allowed or supplier category not found).',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict (Supplier name already exists for this user).',
  })
  async create(
    @Request() req,
    @Body() createSupplierDTO: SupplierCreateDTO,
  ): Promise<SupplierReadDTO> {
    return this.supplierService.create(req.user.id, createSupplierDTO);
  }

  @Get()
  @Roles(
    UserRole.manufacturer,
    UserRole.admin,
    UserRole.brand,
    UserRole.retailer,
  )
  @ApiOperation({ summary: 'Get all suppliers for the logged-in user' })
  @ApiQuery({ type: SupplierQueryDTO })
  @ApiResponse({
    status: 200,
    description: 'List of suppliers.',
    type: [SupplierReadDTO],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(
    @Request() req,
    @Query() query: SupplierQueryDTO,
  ): Promise<SupplierReadDTO[]> {
    return this.supplierService.findAll(req.user.id, query);
  }

  @Get(':id')
  @Roles(
    UserRole.manufacturer,
    UserRole.admin,
    UserRole.brand,
    UserRole.retailer,
  )
  @ApiOperation({ summary: 'Get a specific supplier by ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID (UUID)', type: String })
  @ApiResponse({
    status: 200,
    description: 'Supplier details.',
    type: SupplierReadDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Supplier not found or access denied.',
  })
  async findOne(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SupplierReadDTO> {
    return this.supplierService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @Roles(UserRole.manufacturer, UserRole.admin)
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID (UUID)', type: String })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated successfully.',
    type: SupplierReadDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (Supplier category not found).',
  })
  @ApiResponse({
    status: 404,
    description: 'Supplier not found or access denied.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict (Supplier name or material name already exists).',
  })
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: SupplierUpdateDTO,
  ): Promise<SupplierReadDTO> {
    return this.supplierService.update(req.user.id, id, updateSupplierDto);
  }

  @Delete(':id')
  @Roles(UserRole.manufacturer, UserRole.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Supplier deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Supplier not found or access denied.',
  })
  async remove(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.supplierService.remove(req.user.id, id);
  }
}
