import { MaterialHandleReadDTO } from './materialHandleRead.dto';
import { SpecialtyReadDTO } from './specialtyRead.dto';

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
