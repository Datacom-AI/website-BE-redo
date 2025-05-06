import { IsOptional, IsString } from 'class-validator';

export class CompanyTagUpdateDTO {
  @IsOptional()
  @IsString()
  name?: string;
}
