import { IsBoolean, IsOptional } from 'class-validator';

export class ManufacturerProfileUpdateDTO {
  @IsOptional()
  @IsBoolean()
  isVerifiedManufacturer?: boolean;

  @IsOptional()
  @IsBoolean()
  showProductionCapacity?: boolean;

  @IsOptional()
  @IsBoolean()
  showCertifications?: boolean;
}
