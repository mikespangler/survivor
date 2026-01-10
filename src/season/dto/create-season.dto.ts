import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SeasonStatus } from './season-status.enum';

export class CreateSeasonDto {
  @IsInt()
  @Min(1)
  number: number;

  @IsString()
  name: string;

  @IsEnum(SeasonStatus)
  status: SeasonStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}
