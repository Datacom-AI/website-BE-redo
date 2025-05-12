import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductCategoryService } from './productCategory.service';
import { ProductCategoryCreateDTO } from 'src/common/DTO/product/productCategory/productCategory.Create.dto';
import { ProductCategoryUpdateDTO } from 'src/common/DTO/product/productCategory/productCategory.Update.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole, ProductCategory } from 'generated/prisma';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ProductCategoryReadDTO } from 'src/common/DTO/product/productCategory/productCategory.Read.dto';

@ApiTags('Product Categories')
@Controller('product-categories') // Changed route to be more RESTful
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.admin, UserRole.manufacturer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product category' })
  @ApiResponse({
    status: 201,
    description: 'Product category created successfully.',
    type: ProductCategoryReadDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., category name already exists).',
  })
  async create(
    @Body() dto: ProductCategoryCreateDTO,
  ): Promise<ProductCategory> {
    return this.productCategoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({
    status: 200,
    description: 'List of product categories.',
    type: [ProductCategoryReadDTO],
  })
  async findAll(): Promise<ProductCategory[]> {
    return this.productCategoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product category details.',
    type: ProductCategoryReadDTO,
  })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductCategory> {
    return this.productCategoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.admin, UserRole.manufacturer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product category' })
  @ApiResponse({
    status: 200,
    description: 'Product category updated successfully.',
    type: ProductCategoryReadDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., category name already exists).',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProductCategoryUpdateDTO,
  ): Promise<ProductCategory> {
    return this.productCategoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.admin, UserRole.manufacturer)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product category' })
  @ApiResponse({
    status: 204,
    description: 'Product category deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., category has associated products).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productCategoryService.remove(id);
  }
}
