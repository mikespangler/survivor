import {
  IsString,
  IsOptional,
  IsArray,
  IsEmail,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLeagueDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  inviteEmails?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  castawaysPerTeam?: number;
}
