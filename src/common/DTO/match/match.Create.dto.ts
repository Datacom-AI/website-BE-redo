import { IsNotEmpty, IsUUID } from 'class-validator';

export class MatchCreateDTO {
  @IsNotEmpty()
  @IsUUID('4')
  userTwoId: string;
}
