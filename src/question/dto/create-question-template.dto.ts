import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  Min,
  IsIn,
} from 'class-validator';

export class CreateQuestionTemplateDto {
  @IsString()
  text: string;

  @IsString()
  @IsIn(['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'])
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  pointValue?: number;

  @IsOptional()
  @IsString()
  category?: string;
}
