import { IsOptional, IsNotEmpty, IsString } from 'class-validator';

export class SpecialtyUpdateDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
