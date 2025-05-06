import { IsString, IsNotEmpty, IsInt, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryItemsCreateDTO {
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
}
