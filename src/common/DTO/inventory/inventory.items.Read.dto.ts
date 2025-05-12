import { ProductCatalogReadDTO } from '../product/product.catalog.Read.dto';

export class InventoryItemReadDTO {
  id: string;

  manufacturerDetailsId: string;
  itemName: string;
  itemCategory: string;
  itemSKU: string;
  currentStock: number;
  maximumStock?: number;
  storageLocation?: string;
  description?: string;
  catalogProductId?: string;
  catalogProduct?: ProductCatalogReadDTO;

  createdAt: Date;
  updatedAt: Date;
}
