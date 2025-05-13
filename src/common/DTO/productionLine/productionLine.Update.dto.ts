import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductionLineStatus } from 'generated/prisma';

export class ProductionLineUpdateDTO {
  @ApiPropertyOptional({
    description: 'New name of the production line',
    example: 'Assembly Line Alpha V2',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'New type of production line',
    example: 'Advanced Automated Assembly',
  })
  @IsString()
  @IsOptional()
  lineType?: string;

  @ApiPropertyOptional({
    description: 'New capacity value of the line',
    example: 1200,
  })
  @IsNumber()
  @Min(0.0000000001, { message: 'Capacity value must be positive.' }) // Ensure positive
  @IsOptional()
  capacityValue?: number;

  @ApiPropertyOptional({
    description: 'New unit for the capacity',
    example: 'units/shift',
  })
  @IsString()
  @IsOptional()
  capacityUnit?: string;

  @ApiPropertyOptional({
    description: 'New status of the production line',
    enum: ProductionLineStatus,
  })
  @IsOptional()
  @IsString()
  initialStatus?: ProductionLineStatus;

  @ApiPropertyOptional({
    description: 'New name or ID of the operator assigned',
    example: 'Operator-008',
  })
  @IsString()
  @IsOptional()
  operatorAssigned?: string;

  @ApiPropertyOptional({
    description: 'New target efficiency percentage (0-100)',
    example: 96.0,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  targetEfficiency?: number;

  @ApiPropertyOptional({
    description: 'New date of the next scheduled maintenance (ISO 8601)',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  nextMaintenanceDate?: string;

  @ApiPropertyOptional({
    description: 'Updated notes or details',
    example: 'Upgraded with new sensors.',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
