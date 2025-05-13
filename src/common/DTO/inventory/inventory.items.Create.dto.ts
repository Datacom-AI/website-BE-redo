import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsIn,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryItemCreateDTO {
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @IsNotEmpty()
  @IsString()
  itemCategory: string;

  @IsNotEmpty()
  @IsString()
  itemSKU: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  currentStock: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maximumStock?: number;

  @IsOptional()
  @IsString()
  storageLocation?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Linked catalog product ID' })
  @IsOptional()
  @IsUUID()
  catalogProductId?: string;
}
