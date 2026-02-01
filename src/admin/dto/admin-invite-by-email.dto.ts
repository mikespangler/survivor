import { IsEmail, IsArray, ArrayMinSize } from 'class-validator';

export class AdminInviteByEmailDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  emails: string[];
}
