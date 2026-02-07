import { IsBoolean, IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  weeklyQuestionsReminder?: boolean;

  @IsOptional()
  @IsBoolean()
  draftReminder?: boolean;

  @IsOptional()
  @IsBoolean()
  resultsAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  scoringReminder?: boolean;

  @IsOptional()
  @IsBoolean()
  questionsSetupReminder?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['immediate', 'daily_digest', 'never'])
  emailFrequency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(72)
  reminderHoursBefore?: number;
}
