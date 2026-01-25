import { IsArray, IsEmail, IsNotEmpty } from 'class-validator';

export class InviteByEmailDto {
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  emails: string[];
}
