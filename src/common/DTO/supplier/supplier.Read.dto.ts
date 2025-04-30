import { SupplierStatus } from 'generated/prisma';
import { SupplierCategoryReadDTO } from './supplier.category.Read.dto';
import { SupplierMaterialReadDTO } from './supplier.material.Read.dto';

export class SupplierReadDTO {
  id: string;

  name: string;

  supplierCategory: SupplierCategoryReadDTO;

  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  country: string;
  fullAdderess?: string;
  description?: string;
  status: SupplierStatus;
  reliabilityRating?: number;
  leadTime?: string;

  materials: SupplierMaterialReadDTO[];

  createdAt: Date;
  updatedAt: Date;
}
