import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SupplierMaterialCreateDTO {
  @ApiProperty({ description: 'Name of the material' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
