import { IsArray, IsInt, IsNotEmpty, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EpisodeRetentionDto {
  @IsInt()
  @Min(1)
  episodeNumber: number;

  @IsInt()
  @Min(0)
  pointsPerCastaway: number;
}

export class UpdateRetentionConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EpisodeRetentionDto)
  episodes: EpisodeRetentionDto[];
}
