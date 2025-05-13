import { IsOptional, IsInt, IsNumber } from 'class-validator';

export class ManufacturingCapabilityUpdateDTO {
  @IsOptional()
  @IsInt()
  productionCapacity?: number;

  @IsOptional()
  @IsNumber()
  minimumOrderValue?: number;
}
