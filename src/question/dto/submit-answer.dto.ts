import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  answer: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  wagerAmount?: number;
}
