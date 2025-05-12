import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole, CatalogProduct } from 'generated/prisma';
import { ProductCatalogCreateDTO } from 'src/common/DTO/product/product.catalog.Create.dto';
import { ProductCatalogUpdateDTO } from 'src/common/DTO/product/product.catalog.Update.dto';
import { ProductCatalogReadDTO } from 'src/common/DTO/product/product.catalog.Read.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageOption } from 'src/common/interceptor/image.interceptor';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Product Catalog')
@ApiBearerAuth()
@Controller('product')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.manufacturer)
  @UseInterceptors(FileInterceptor('productImage', ImageOption))
  @ApiOperation({ summary: 'Create a new catalog product (Manufacturer only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data and optional image file.',
    type: ProductCatalogCreateDTO,
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully.',
    type: ProductCatalogReadDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden (User is not a manufacturer or manufacturer profile incomplete).',
  })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., SKU already exists for manufacturer).',
  })
  async createProduct(
    @Request() req,
    @Body() dto: ProductCatalogCreateDTO,
    @UploadedFile() productImageFile?: Express.Multer.File,
  ): Promise<ProductCatalogReadDTO> {
    return this.productService.createProduct(
      req.user.id,
      dto,
      productImageFile,
    );
  }

  @Get('manufacturer')
  @Roles(UserRole.manufacturer)
  @ApiOperation({ summary: 'Get all products for the logged-in manufacturer' })
  @ApiResponse({
    status: 200,
    description: 'List of products for the manufacturer.',
    type: [ProductCatalogReadDTO],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getManufacturerProducts(
    @Request() req,
  ): Promise<ProductCatalogReadDTO[]> {
    return this.productService.findAllProductsByManufacturer(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details.',
    type: ProductCatalogReadDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async getProductById(
    @Param('id', ParseUUIDPipe) productId: string,
  ): Promise<ProductCatalogReadDTO> {
    return this.productService.findOneProduct(productId);
  }

  @Patch(':id')
  @Roles(UserRole.manufacturer)
  @UseInterceptors(FileInterceptor('productImage', ImageOption))
  @ApiOperation({
    summary: 'Update a catalog product (Manufacturer only, owner)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product update data and optional new image file.',
    type: ProductCatalogUpdateDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully.',
    type: ProductCatalogReadDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (Not owner or not manufacturer).',
  })
  @ApiResponse({ status: 404, description: 'Product or Category not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., SKU already exists).',
  })
  async updateProduct(
    @Request() req,
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: ProductCatalogUpdateDTO,
    @UploadedFile() productImageFile?: Express.Multer.File,
  ): Promise<ProductCatalogReadDTO> {
    return this.productService.updateProduct(
      req.user.id,
      productId,
      dto,
      productImageFile,
    );
  }

  @Delete(':id')
  @Roles(UserRole.manufacturer)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a catalog product (Manufacturer only, owner)',
  })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., product has active orders).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (Not owner or not manufacturer).',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async deleteProduct(
    @Request() req,
    @Param('id', ParseUUIDPipe) productId: string,
  ): Promise<void> {
    await this.productService.deleteProduct(req.user.id, productId);
  }
}
