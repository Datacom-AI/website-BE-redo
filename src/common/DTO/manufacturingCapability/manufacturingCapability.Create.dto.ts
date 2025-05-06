import { IsOptional, IsInt, IsNumber } from 'class-validator';

export class ManufacturingCapabilityCreateDTO {
  @IsOptional()
  @IsInt()
  productionCapacity?: number;

  @IsOptional()
  @IsNumber()
  minimumOrderQuantity?: number;
}
