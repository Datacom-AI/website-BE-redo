import { ProductCategoryReadDTO } from './productCategory/productCategory.Read.dto';
import { LeadTimeUnit, ProductType, UnitType } from 'generated/prisma';

export class ProductCatalogReadDTO {
  id: string;

  productCategory: ProductCategoryReadDTO;

  minimumOrderQuantity: number;
  dailyCapacity: number;
  unitType: UnitType;
  currentAvailableStock: number;
  pricePerUnit: number;
  productType: ProductType;
  leadTime?: string;
  leadTimeUnit: LeadTimeUnit;
  description?: string;
  imageUrl?: string;
  isSustainableProduct: boolean;
  productSKU: string;

  createdAt: Date;
  updatedAt: Date;
}
