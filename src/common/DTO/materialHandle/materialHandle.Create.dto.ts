import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class MaterialHandleCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  manufacturingCapabilityId: string;
}
