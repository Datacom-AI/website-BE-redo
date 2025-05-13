import { ProductCategoryReadDTO } from './productCategory/productCategory.Read.dto';
import { LeadTimeUnit, ProductType, UnitType } from 'generated/prisma';

// ...existing code...
export class ProductCatalogReadDTO {
  id: string;
  manufacturerDetailsId: string;

  productCategory?: ProductCategoryReadDTO;

  name: string;
  minimumOrderQuantity: number;
  dailyCapacity: number;
  unitType: UnitType;
  stockLevel: number;
  pricePerUnit: number;
  productType: ProductType;
  leadTime?: string | null;
  leadTimeUnit: LeadTimeUnit;

  description?: string | null;
  image?: string | null;

  isSustainableProduct: boolean;
  productSKU: string;

  isBestSeller: boolean;
  isPopular: boolean;

  createdAt: Date;
  updatedAt: Date;
}
