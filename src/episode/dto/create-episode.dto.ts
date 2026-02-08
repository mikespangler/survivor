import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateEpisodeDto {
  @IsString()
  seasonId: string;

  @IsInt()
  @Min(1)
  number: number;

  @IsOptional()
  @IsDateString()
  airDate?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
