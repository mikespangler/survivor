import { IsString, IsNotEmpty } from 'class-validator';

export class JoinByTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
