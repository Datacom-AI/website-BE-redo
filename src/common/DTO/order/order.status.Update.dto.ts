import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from 'generated/prisma';

export class OrderUpdateStatusDTO {
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;
}
