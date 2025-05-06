export class InventoryItemsReadDTO {
  id: string;

  itemName: string;
  itemCategory: string;
  itemSKU: string;
  currentStock: number;
  maximumStock?: number | null;
  storageLocation?: string | null;
  description?: string | null;

  createdAt: Date;
  updatedAt: Date;
}
