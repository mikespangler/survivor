import { IsArray, IsInt, IsString, Min } from 'class-validator';

export class CreateFromTemplatesDto {
  @IsInt()
  @Min(1)
  episodeNumber: number;

  @IsArray()
  @IsString({ each: true })
  templateIds: string[];
}
