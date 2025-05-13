import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

import { InventoryItemCreateDTO } from 'src/common/DTO/inventory/inventory.items.Create.dto';
import { InventoryItemUpdateDTO } from 'src/common/DTO/inventory/inventory.items.Update.dto';
import { InventoryItemReadDTO } from 'src/common/DTO/inventory/inventory.items.Read.dto';

import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles('manufacturer')
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({
    status: 201,
    description: 'Inventory item created successfully',
    type: InventoryItemReadDTO,
  })
  async createInventoryItem(
    @Request() req,
    @Body() createDto: InventoryItemCreateDTO,
  ): Promise<InventoryItemReadDTO> {
    const userId = req.user.id;
    return this.inventoryService.createInventoryItem(userId, createDto);
  }

  @Get()
  @Roles('manufacturer')
  @ApiOperation({ summary: 'Get all inventory items for the manufacturer' })
  @ApiResponse({
    status: 200,
    description: 'Returns all inventory items',
    type: [InventoryItemReadDTO],
  })
  async findAllInventoryItems(@Request() req): Promise<InventoryItemReadDTO[]> {
    const userId = req.user.id;
    return this.inventoryService.findAllInventoryItems(userId);
  }

  @Get(':id')
  @Roles('manufacturer')
  @ApiOperation({ summary: 'Get an inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the inventory item',
    type: InventoryItemReadDTO,
  })
  async findOneInventoryItem(
    @Request() req,
    @Param('id', ParseUUIDPipe) itemId: string,
  ): Promise<InventoryItemReadDTO> {
    const userId = req.user.id;
    return this.inventoryService.findOneInventoryItem(userId, itemId);
  }

  @Put(':id')
  @Roles('manufacturer')
  @ApiOperation({ summary: 'Update an inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item updated successfully',
    type: InventoryItemReadDTO,
  })
  async updateInventoryItem(
    @Request() req,
    @Param('id', ParseUUIDPipe) itemId: string,
    @Body() updateDto: InventoryItemUpdateDTO,
  ): Promise<InventoryItemReadDTO> {
    const userId = req.user.id;
    return this.inventoryService.updateInventoryItem(userId, itemId, updateDto);
  }

  @Delete(':id')
  @Roles('manufacturer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: 204,
    description: 'Inventory item deleted successfully',
  })
  async deleteInventoryItem(
    @Request() req,
    @Param('id', ParseUUIDPipe) itemId: string,
  ): Promise<void> {
    const userId = req.user.id;
    await this.inventoryService.deleteInventoryItem(userId, itemId);
  }

  //   @Delete('admin-hard-delete/:id')
  //   @Roles('admin')
  //   @HttpCode(HttpStatus.NO_CONTENT)
  //   @ApiOperation({ summary: 'ADMIN: Hard delete an inventory item' })
  //   @ApiParam({ name: 'id', description: 'Inventory item ID' })
  //   @ApiResponse({
  //     status: 204,
  //     description: 'Inventory item hard deleted by admin',
  //   })
  //   async hardDeleteInventoryItem(
  //     @Param('id', ParseUUIDPipe) itemId: string,
  //   ): Promise<void> {
  //     await this.inventoryService.hardDeleteInventoryItem(itemId);
  //   }
}
