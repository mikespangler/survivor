import { IsOptional, IsObject } from 'class-validator';

export class UpdateLeagueSeasonSettingsDto {
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
