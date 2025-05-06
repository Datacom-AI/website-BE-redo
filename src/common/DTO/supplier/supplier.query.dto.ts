import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsIn,
} from 'class-validator';
import { SupplierStatus } from 'generated/prisma';

export class SupplierQueryDTO {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  supplierCategoryId?: string;

  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc' = 'asc';
}
