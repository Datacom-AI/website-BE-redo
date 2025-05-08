import { Status } from 'generated/prisma';

import { SupplierCategoryReadDTO } from './supplier.category.Read.dto';
import { SupplierMaterialReadDTO } from './supplier.material.Read.dto';

export class SupplierReadDTO {
  id: string;

  userId: string;

  name: string;

  supplierCategory: SupplierCategoryReadDTO;

  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  country: string;

  fullAddress?: string | null;
  description?: string | null;
  status: Status;
  reliabilityRating?: number | null;
  leadTime?: string | null;

  materials: SupplierMaterialReadDTO[];

  createdAt: Date;
  updatedAt: Date;
}
