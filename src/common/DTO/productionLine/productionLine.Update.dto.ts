import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ProductionLineUpdateDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lineType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  initialStatus?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  operatorAssigned?: string;

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
