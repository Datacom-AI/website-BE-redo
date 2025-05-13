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
import { ProductionLineService } from './production-line.service';
import { ProductionLineCreateDTO } from 'src/common/DTO/productionLine/productionLine.Create.dto';
import { ProductionLineUpdateDTO } from 'src/common/DTO/productionLine/productionLine.Update.dto';
import { ProductionLineReadDTO } from 'src/common/DTO/productionLine/productionLine.Read.dto';
import { ProductionLineQueryDTO } from 'src/common/DTO/productionLine/productionLine.Query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from 'generated/prisma';
import { AuthenticatedUser } from 'src/common/interface';
// ...existing code...
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

// ... imports ...

@ApiTags('Production Lines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('production-lines') // Changed route
export class ProductionLineController {
  constructor(private readonly productionLineService: ProductionLineService) {}

  @Post()
  @Roles(UserRole.manufacturer, UserRole.admin)
  @ApiOperation({ summary: 'Create a new production line' })
  // Admin might need to pass manufacturerDetailsId in the body
  // Manufacturer's manufacturerDetailsId is inferred
  @ApiResponse({ status: 201, type: ProductionLineReadDTO })
  // ... other ApiResponses
  async create(
    @Request() req: { user: AuthenticatedUser },
    @Body() createDto: ProductionLineCreateDTO, // This DTO might need manufacturerDetailsId for admin
  ): Promise<ProductionLineReadDTO> {
    // Service will differentiate logic based on user.role
    return this.productionLineService.create(req.user, createDto);
  }

  @Get()
  @Roles(UserRole.manufacturer, UserRole.admin)
  @ApiOperation({ summary: 'Get production lines' })
  // Admin might use a query param for manufacturerDetailsId
  // Manufacturer gets their own lines
  @ApiQuery({ type: ProductionLineQueryDTO }) // QueryDTO might need manufacturerDetailsId for admin
  @ApiResponse({ status: 200, type: [ProductionLineReadDTO] })
  // ... other ApiResponses
  async findAll(
    @Request() req: { user: AuthenticatedUser },
    @Query() query: ProductionLineQueryDTO,
  ): Promise<ProductionLineReadDTO[]> {
    return this.productionLineService.findAll(req.user, query);
  }

  @Get(':productionLineId')
  @Roles(UserRole.manufacturer, UserRole.admin)
  @ApiOperation({ summary: 'Get a specific production line by ID' })
  @ApiParam({ name: 'productionLineId', type: String })
  @ApiQuery({
    name: 'manufacturerDetailsId',
    required: false,
    type: String,
    description:
      'Manufacturer Details ID (for Admin users to scope the production line)',
  })
  @ApiResponse({ status: 200, type: ProductionLineReadDTO })
  // ... other ApiResponses
  async findOne(
    @Request() req: { user: AuthenticatedUser },
    @Param('productionLineId', ParseUUIDPipe) productionLineId: string,
    @Query('manufacturerDetailsId') manufacturerDetailsId?: string,
  ): Promise<ProductionLineReadDTO> {
    return this.productionLineService.findOne(
      req.user,
      productionLineId,
      manufacturerDetailsId,
    );
  }

  @Patch(':productionLineId')
  @Roles(UserRole.manufacturer, UserRole.admin)
  @ApiOperation({ summary: 'Update a production line' })
  @ApiParam({ name: 'productionLineId', type: String })
  // Admin might need to pass manufacturerDetailsId in the body if updating a line for a specific manufacturer
  // and the productionLineId alone isn't sufficient or needs cross-checking.
  // Manufacturer can only update their own lines.
  @ApiResponse({ status: 200, type: ProductionLineReadDTO })
  // ... other ApiResponses
  async update(
    @Request() req: { user: AuthenticatedUser },
    @Param('productionLineId', ParseUUIDPipe) productionLineId: string,
    @Body() updateDto: ProductionLineUpdateDTO, // This DTO might need manufacturerDetailsId for admin
  ): Promise<ProductionLineReadDTO> {
    return this.productionLineService.update(
      req.user,
      productionLineId,
      updateDto,
    );
  }

  @Delete(':productionLineId')
  @Roles(UserRole.manufacturer, UserRole.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a production line' })
  @ApiParam({ name: 'productionLineId', type: String })
  @ApiQuery({
    name: 'manufacturerDetailsId',
    required: false,
    type: String,
    description:
      'Manufacturer Details ID (for Admin users to scope/verify the production line before deletion)',
  })
  @ApiResponse({ status: 204 })
  async remove(
    @Request() req: { user: AuthenticatedUser },
    @Param('productionLineId', ParseUUIDPipe) productionLineId: string,
    @Query('manufacturerDetailsId') manufacturerDetailsId: string,
  ): Promise<void> {
    await this.productionLineService.remove(
      req.user,
      productionLineId,
      manufacturerDetailsId,
    );
  }
}
