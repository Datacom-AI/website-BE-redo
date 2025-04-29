import { ManufacturingCapabilityReadDTO } from '../others/manufacturingCapabilityRead.dto';

export class ManufacturerProfileReadDTO {
  id: string;

  manufacturingCapability?: ManufacturingCapabilityReadDTO;

  isVerifiedManufacturer: boolean;
  showProductionCapacity: boolean;
  showCertifications: boolean;

  createdAt: Date;
  updatedAt: Date;
}
