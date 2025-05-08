import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ConnectionStatus } from 'generated/prisma';

export class MatchUserStatusUpdateDTO {
  @IsNotEmpty()
  @IsUUID('4')
  matchId: string;

  @IsOptional()
  @IsEnum(ConnectionStatus)
  status?: ConnectionStatus;

  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;
}
