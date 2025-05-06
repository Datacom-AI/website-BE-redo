import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StoreLocationCreateDTO {
  @IsNotEmpty()
  @IsUUID('4')
  retailerProfileId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  addressStreet?: string;

  @IsOptional()
  @IsString()
  addressCity?: string;

  @IsOptional()
  @IsString()
  addressState?: string;

  @IsOptional()
  @IsString()
  addressZipCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sizeSqFt?: number;

  @IsOptional()
  @IsString()
  locationType?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPrimary?: boolean;
}
