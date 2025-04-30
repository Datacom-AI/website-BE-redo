import {
  IsOptional,
  IsInt,
  IsNumber,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class ManufacturingCapabilityCreateDTO {
  @IsOptional()
  @IsInt()
  productionCapacity?: number;

  @IsOptional()
  @IsNumber()
  minimumOrderQuantity?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  certificationCompliance?: string;
}
