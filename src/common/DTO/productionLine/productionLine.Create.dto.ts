import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductionLineStatus } from 'generated/prisma';

export class ProductionLineCreateDTO {
  @ApiProperty({
    description:
      'ID of the ManufacturerDetails this production line belongs to (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  manufacturerDetailsId: string;

  @ApiProperty({
    description: 'Name of the production line',
    example: 'Assembly Line Alpha',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Type of production line',
    example: 'Automated Assembly',
  })
  @IsString()
  @IsOptional()
  lineType: string;

  @ApiProperty({
    description: 'Capacity value of the line (e.g., units per hour)',
    example: 1000,
  })
  @IsNumber()
  @Min(0.0000000001, { message: 'Capacity value must be positive.' })
  capacityValue: number;

  @ApiProperty({
    description: 'Unit for the capacity (e.g., units/hour, kg/day)',
    example: 'units/hour',
  })
  @IsString()
  @IsNotEmpty()
  capacityUnit: string;

  @ApiProperty({
    description: 'Date when the production line became operational (ISO 8601)',
    example: '2023-01-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  operationalSince: string;

  @ApiPropertyOptional({
    description: 'Current status of the production line',
    enum: ProductionLineStatus,
    example: 'active',
  })
  @IsOptional()
  @IsString()
  initialStatus: ProductionLineStatus;

  @ApiPropertyOptional({
    description: 'Name or ID of the operator assigned',
    example: 'Operator-007',
  })
  @IsString()
  @IsOptional()
  operatorAssigned: string;

  @ApiPropertyOptional({
    description: 'Target efficiency percentage (0-100)',
    example: 95.5,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  targetEfficiency: number;

  @ApiPropertyOptional({
    description: 'Date of the next scheduled maintenance (ISO 8601)',
    example: '2025-12-31T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  nextMaintenanceDate: string;

  @ApiPropertyOptional({
    description: 'Additional notes or details about the production line',
    example: 'Handles primary assembly tasks.',
  })
  @IsString()
  @IsOptional()
  notes: string;
}
