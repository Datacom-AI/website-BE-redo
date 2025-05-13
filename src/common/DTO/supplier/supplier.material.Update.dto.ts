import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SupplierMaterialUpdateDTO {
  @ApiProperty({ description: 'ID of the supplier material to update ' })
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @ApiPropertyOptional({
    description: 'New name for the material supplied',
    example: 'Organic Cotton Grade A',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
