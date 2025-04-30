import { ManufacturingCapabilityReadDTO } from '../manufacturingCapability/manufacturingCapability.Read.dto';

export class ManufacturerProfileReadDTO {
  id: string;

  manufacturingCapability?: ManufacturingCapabilityReadDTO;

  isVerifiedManufacturer: boolean;
  showProductionCapacity: boolean;
  showCertifications: boolean;

  createdAt: Date;
  updatedAt: Date;
}
