import { ProductCategoryReadDTO } from '../product/productCategory/productCategory.Read.dto';

export class RetailerProductReadDTO {
  id: string;

  retailerProfileId: string;
  categoryId: string;

  category: ProductCategoryReadDTO;

  sku: string;
  name: string;

  description?: string | null;

  stockLevel: number;
  needsRestock: boolean;
  reorderPoint?: number | null;
  price?: number | null;

  createdAt: Date;
  updatedAt: Date;
}
