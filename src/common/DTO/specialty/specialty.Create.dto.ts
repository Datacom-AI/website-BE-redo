import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SpecialtyCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  manufacturingCapabilityId: string;
}
