import { IsString, IsOptional, IsNotEmpty, IsInt } from 'class-validator';

export class InventoryItemsUpdateDTO {
  // ID is in the route parameter
  // userId and manufacturerProfileId are excluded

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  itemName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  itemCategory?: string;

  @IsOptional()
  @IsInt()
  @IsNotEmpty() // Need IsNotEmpty if stock cannot be updated to null/empty string (which is true for int)
  currentStock?: number; // Allow partial update of stock

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
