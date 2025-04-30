import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class MaterialHandleUpdateDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
