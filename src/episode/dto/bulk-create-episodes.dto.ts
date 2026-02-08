import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EpisodeData {
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

export class BulkCreateEpisodesDto {
  @IsString()
  seasonId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EpisodeData)
  episodes: EpisodeData[];
}
