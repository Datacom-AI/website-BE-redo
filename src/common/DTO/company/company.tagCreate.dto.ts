import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CompanyTagCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  companyId: string;
}
