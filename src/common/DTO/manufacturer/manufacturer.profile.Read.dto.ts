import { ManufacturingCapabilityReadDTO } from '../manufacturingCapability/manufacturingCapability.Read.dto';

export class ManufacturerProfileReadDTO {
  id: string;
  userId: string;

  manufacturingCapability?: ManufacturingCapabilityReadDTO | null;

  productsCount?: number;
  inventoryItemsCount?: number;
  certificationCount?: number;
  productionLinesCount?: number;

  isVerifiedManufacturer: boolean;
  showProductionCapacity: boolean;
  showCertifications: boolean;

  createdAt: Date;
  updatedAt: Date;
}
