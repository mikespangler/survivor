import { IsInt, IsOptional, IsString, Min, IsDateString } from 'class-validator';

export class UpdateDraftConfigDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  roundNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  castawaysPerTeam?: number;

  @IsOptional()
  @IsDateString()
  draftDate?: string;

  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

