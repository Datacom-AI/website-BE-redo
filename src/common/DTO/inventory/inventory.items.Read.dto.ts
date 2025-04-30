export class InventoryItemsReadDTO {
  id: string;

  itemName: string;
  itemCategory: string;
  itemSKU: string;
  currentStock: number;
  maximumStock?: number;
  storageLocation?: string;
  description?: string;

  createdAt: Date;
  updatedAt: Date;
}
