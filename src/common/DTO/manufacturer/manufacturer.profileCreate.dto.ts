import { IsBoolean, IsOptional } from 'class-validator';

export class ManufacturerProfileCreateDTO {
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
