import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  Min,
  IsIn,
} from 'class-validator';

export class UpdateLeagueQuestionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  episodeNumber?: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'])
  type?: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  pointValue?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
