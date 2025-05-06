import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductionLineUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lineType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacityValue?: number;

  @IsOptional()
  @IsString()
  capacityUnit?: string;

  @IsOptional()
  @IsString()
  initialStatus?: string;

  @IsOptional()
  @IsString()
  operatorAssigned?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  targetEfficiency?: number;

  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;

  @IsOptional()
  @IsDateString()
  operationalSince?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  energyConsumptionKwh?: number;
}
