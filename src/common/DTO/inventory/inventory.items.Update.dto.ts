import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryItemsUpdateDTO {
  @IsOptional()
  @IsString()
  itemName?: string;

  @IsOptional()
  @IsString()
  itemCategory?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  currentStock?: number;

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
}
