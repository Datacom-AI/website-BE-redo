import { IsString, IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryItemUpdateDTO {
  @IsOptional()
  @IsString()
  itemName?: string;

  @IsOptional()
  @IsString()
  itemCategory?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maximumStock?: number;

  @IsOptional()
  @IsString()
  storageLocation?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  catalogProductId?: string;
}
