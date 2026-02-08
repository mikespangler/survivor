import { IsString } from 'class-validator';

export class AddCastawayDto {
  @IsString()
  castawayId: string;
}
