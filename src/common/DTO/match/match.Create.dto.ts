import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class MatchCreateDTO {
  @IsNotEmpty()
  @IsUUID()
  brandId: string;

  @IsNotEmpty()
  @IsUUID()
  manufacturerId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
