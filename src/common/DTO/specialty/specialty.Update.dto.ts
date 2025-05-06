import { IsOptional, IsString } from 'class-validator';

export class SpecialtyUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;
}
