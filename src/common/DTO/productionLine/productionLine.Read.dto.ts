import { ApiProperty } from '@nestjs/swagger';
import { ProductionLineStatus } from 'generated/prisma';

export class ProductionLineReadDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  manufacturerDetailsId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  lineType: string;

  @ApiProperty()
  capacityValue: number;

  @ApiProperty()
  capacityUnit: string;

  @ApiProperty({ enum: ProductionLineStatus, required: false })
  initialStatus: ProductionLineStatus;

  @ApiProperty({ required: false })
  operatorAssigned: string | null;

  @ApiProperty({ required: false })
  targetEfficiency: number | null;

  @ApiProperty({ required: false })
  nextMaintenanceDate: string | undefined;

  @ApiProperty({ required: false })
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
