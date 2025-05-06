import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { MatchingStatus } from 'generated/prisma';

export class MatchUserStatusUpdateDTO {
  @IsNotEmpty()
  @IsUUID('4')
  matchId: string;

  @IsOptional()
  @IsEnum(MatchingStatus)
  status?: MatchingStatus;

  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;
}
