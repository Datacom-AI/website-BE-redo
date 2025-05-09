import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { PartnershipService } from './partnership.service';
import { PartnershipCreateDTO } from 'src/common/DTO/partnership/partnership.Create.dto';
import { Partnership } from 'generated/prisma';
import { PartnershipUpdateDTO } from 'src/common/DTO/partnership/partnership.Update.dto';

@ApiTags('partnership')
@Controller('partnership')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('manufacturer', 'brand', 'retailer')
export class PartnershipController {
  constructor(private partnershipService: PartnershipService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPartnership(
    @Request() req,
    @Body() dto: PartnershipCreateDTO,
  ): Promise<Partnership> {
    return await this.partnershipService.createPartnershipService(
      req.user.id,
      dto,
    );
  }

  @Patch(':id')
  async updatePartnershipService(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: PartnershipUpdateDTO,
  ): Promise<Partnership> {
    return this.partnershipService.updatePartnershipService(
      req.user.id,
      id,
      dto,
    );
  }

  @Get()
  async getPartnerships(@Request() req): Promise<Partnership[]> {
    return await this.partnershipService.getPartnershipsService(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePartnership(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.partnershipService.deletePartnershipService(
      req.user.id,
      id,
    );
  }
}
