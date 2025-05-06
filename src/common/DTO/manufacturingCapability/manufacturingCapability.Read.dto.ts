import { MaterialHandleReadDTO } from '../materialHandle/materialHandle.Read.dto';
import { SpecialtyReadDTO } from '../specialty/specialty.Read.dto';

export class ManufacturingCapabilityReadDTO {
  id: string;

  productionCapacity?: number;
  minimumOrderQuantity?: number;

  certificatingCompliance?: string;

  materialHandles?: MaterialHandleReadDTO[];
  specialties?: SpecialtyReadDTO[];

  createdAt: Date;
  updatedAt: Date;
}
