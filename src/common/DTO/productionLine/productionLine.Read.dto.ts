export class ProductionLineReadDTO {
  id: string;

  name: string;
  lineType: string;
  initialStatus?: string;
  operatorAssigned: string;
  targetEfficiency?: number;
  nextMaintenanceDate: Date;
  operationalSince?: Date;
  energyConsumptionKwh?: number;

  createdAt: Date;
  updatedAt: Date;
}
