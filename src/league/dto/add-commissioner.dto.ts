import { IsString, IsNotEmpty } from 'class-validator';

export class AddCommissionerDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
