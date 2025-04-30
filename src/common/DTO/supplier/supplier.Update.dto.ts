import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SupplierStatus } from 'generated/prisma';

export class SupplierUpdateDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsUUID()
  supplierCategoryId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullAdderess?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @IsOptional()
  @IsNumber()
  reliabilityRating?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  leadTime?: string;
}
