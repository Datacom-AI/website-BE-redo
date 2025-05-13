import { IsOptional, IsNumber, Min, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductionLineQueryDTO {
  @ApiPropertyOptional({ description: 'Filter by minimum capacity value' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minCapacityValue?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum capacity value' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxCapacityValue?: number;

  @ApiPropertyOptional({ description: 'Field to order by', example: 'name' })
  @IsOptional()
  @IsString()
  orderBy?: string; // Add more specific validation if needed (e.g., IsIn specific fields)

  @ApiPropertyOptional({
    description: 'Order direction',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Number of records to skip (for pagination)',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Number of records to return (for pagination)',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
