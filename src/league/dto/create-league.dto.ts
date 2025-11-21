import { IsString, IsOptional, IsArray, IsEmail, MinLength } from 'class-validator';

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
}

