import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ProductionLineCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lineType: string;

  @IsOptional()
  @IsString()
  initialStatus?: string;

  @IsOptional()
  @IsString()
  operatorAssigned: string;

  @IsOptional()
  @IsInt()
  targetEfficiency?: number;

  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;

  @IsOptional()
  @IsDateString()
  operationalSince?: string;

  @IsOptional()
  @IsNumber()
  energyConsumptionKwh?: number;
}
