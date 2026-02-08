import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsDateString,
} from 'class-validator';

export class UpdateEpisodeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @IsOptional()
  @IsDateString()
  airDate?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
