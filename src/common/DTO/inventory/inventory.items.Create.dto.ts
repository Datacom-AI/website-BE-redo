import { IsString, IsNotEmpty, IsInt, IsOptional, IsIn } from 'class-validator';

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
  @IsInt()
  currentStock: number;

  @IsOptional()
  @IsInt()
  maximumStock?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  storageLocation?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
