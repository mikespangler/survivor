import { IsString, IsOptional, IsObject } from 'class-validator';

export class TrackEventDto {
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
