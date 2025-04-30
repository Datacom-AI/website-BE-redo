import { IsNotEmpty, IsString } from 'class-validator';

export class CompanyTagCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;
}
