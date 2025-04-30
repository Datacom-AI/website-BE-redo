import { IsNotEmpty, IsString } from 'class-validator';

export class RetailerProfileCreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;
}
