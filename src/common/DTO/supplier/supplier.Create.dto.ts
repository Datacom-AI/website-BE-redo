import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsEmail,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from 'generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierMaterialCreateDTO } from './supplier.material.Create.dto';

export class SupplierCreateDTO {
  @ApiProperty({
    description: 'Name of the supplier',
    example: 'Global Textiles Inc.',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Contact person at the supplier',
    example: 'Jane Doe',
  })
  @IsNotEmpty()
  @IsString()
  contactPerson: string;

  @ApiProperty({
    description: 'Contact email of the supplier',
    example: 'jane.doe@globaltextiles.com',
  })
  @IsNotEmpty()
  @IsEmail()
  contactEmail: string;

  @ApiProperty({
    description: 'Contact phone of the supplier',
    example: '+1-555-123-4567',
  })
  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @ApiProperty({
    description: 'City where the supplier is located',
    example: 'New York',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Country where the supplier is located',
    example: 'USA',
  })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiPropertyOptional({
    description: 'Full address of the supplier',
    example: '123 Main St, New York, NY 10001, USA',
  })
  @IsOptional()
  @IsString()
  fullAddress?: string;

  @ApiPropertyOptional({
    description: 'Description of the supplier',
    example: 'Leading supplier of quality textiles.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the supplier',
    enum: Status,
    example: Status.active,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({
    description: 'Reliability rating of the supplier (0-5)',
    example: 4.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reliabilityRating?: number;

  @ApiPropertyOptional({
    description: 'Typical lead time for orders',
    example: '2-4 weeks',
  })
  @IsOptional()
  @IsString()
  leadTime?: string;

  @ApiPropertyOptional({
    type: () => [SupplierMaterialCreateDTO],
    description: 'List of materials provided by the supplier',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierMaterialCreateDTO)
  materials?: SupplierMaterialCreateDTO[];
}
