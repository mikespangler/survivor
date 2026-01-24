import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionAnswer {
  @IsString()
  questionId: string;

  @IsString()
  correctAnswer: string;
}

export class SetCorrectAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswer)
  answers: QuestionAnswer[];
}
