import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductionLineCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

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

  @IsNotEmpty()
  @IsString()
  operatorAssigned: string;

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
