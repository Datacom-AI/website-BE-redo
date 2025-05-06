export class ProductionLineReadDTO {
  id: string;
  manufacturerProfileId: string;
  name: string;
  lineType?: string | null;
  capacityValue?: number | null;
  capacityUnit?: string | null;
  initialStatus?: string | null;
  operatorAssigned: string;
  targetEfficiency?: number | null;
  nextMaintenanceDate?: Date | null;
  operationalSince?: Date | null;
  energyConsumptionKwh?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
