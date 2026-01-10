import { IsEnum, IsString } from 'class-validator';
import { CastawayStatus } from './castaway-status.enum';

export class CreateCastawayDto {
  @IsString()
  name: string;

  @IsString()
  seasonId: string;

  @IsEnum(CastawayStatus)
  status: CastawayStatus;
}
