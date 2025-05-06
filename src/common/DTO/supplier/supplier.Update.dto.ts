import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SupplierStatus } from 'generated/prisma';

export class SupplierUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID('4')
  supplierCategoryId?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  fullAddress?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reliabilityRating?: number;

  @IsOptional()
  @IsString()
  leadTime?: string;
}
