import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from 'generated/prisma';
import { ApiPropertyOptional } from '@nestjs/swagger'; // Added
import { SupplierMaterialUpdateDTO } from './supplier.material.Update.dto';
import { SupplierMaterialCreateDTO } from './supplier.material.Create.dto';

export class SupplierUpdateDTO {
  @ApiPropertyOptional({
    description: 'New name of the supplier',
    example: 'Global Textiles Corp.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'New ID of the supplier category',
    example: 'clq456def0001example...',
  })
  @IsOptional()
  @IsUUID('4')
  supplierCategoryId?: string;

  @ApiPropertyOptional({
    description: 'New contact person at the supplier',
    example: 'John Smith',
  })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({
    description: 'New contact email of the supplier',
    example: 'john.smith@globaltextiles.com',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'New contact phone of the supplier',
    example: '+1-555-765-4321',
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'New city where the supplier is located',
    example: 'Los Angeles',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'New country where the supplier is located',
    example: 'USA',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'New full address of the supplier',
    example: '456 Market St, Los Angeles, CA 90001, USA',
  })
  @IsOptional()
  @IsString()
  fullAddress?: string;

  @ApiPropertyOptional({
    description: 'New description of the supplier',
    example: 'Premier supplier of eco-friendly textiles.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'New status of the supplier',
    enum: Status,
    example: Status.inactive,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({
    description: 'New reliability rating of the supplier (0-5)',
    example: 4.8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reliabilityRating?: number;

  @ApiPropertyOptional({
    description: 'New typical lead time for orders',
    example: '1-3 weeks',
  })
  @IsOptional()
  @IsString()
  leadTime?: string;

  @ApiPropertyOptional({
    type: () => [SupplierMaterialCreateDTO],
    description: 'List of new materials to add for the supplier',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierMaterialCreateDTO)
  createMaterials?: SupplierMaterialCreateDTO[];

  @ApiPropertyOptional({
    description: 'List of existing materials to update for the supplier',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  updateMaterials?: SupplierMaterialUpdateDTO[];

  @ApiPropertyOptional({
    type: [String],
    description: 'List of material IDs to delete from the supplier',
    example: ['clq789ghi0002example...'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  deleteMaterialIds?: string[];
}
