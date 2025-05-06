import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SupplierStatus } from 'generated/prisma';

export class SupplierCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID('4')
  supplierCategoryId: string;

  @IsNotEmpty()
  @IsString()
  contactPerson: string;

  @IsNotEmpty()
  @IsEmail()
  contactEmail: string;

  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  country: string;

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
