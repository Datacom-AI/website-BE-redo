import { ProductCategoryReadDTO } from './productCategory/productCategory.Read.dto';
import { LeadTimeUnit, ProductType, UnitType } from 'generated/prisma';

export class ProductCatalogReadDTO {
  id: string;
  manufacturerProfileId: string;

  productCategory: ProductCategoryReadDTO;

  minimumOrderQuantity: number;
  dailyCapacity: number;
  unitType: UnitType;
  currentAvailableStock: number;
  pricePerUnit: number;
  productType: ProductType;
  leadTime?: string | null;
  leadTimeUnit: LeadTimeUnit;

  description?: string | null;
  imageUrl?: string | null;

  isSustainableProduct: boolean;
  productSKU: string;

  isBestSeller: boolean;
  isPopular: boolean;

  createdAt: Date;
  updatedAt: Date;
}
