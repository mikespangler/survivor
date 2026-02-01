import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateTeamNameDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;
}
