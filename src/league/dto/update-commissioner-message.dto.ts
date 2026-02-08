import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class UpdateCommissionerMessageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  content?: any; // TipTap JSON

  @IsOptional()
  @IsString()
  contentPlain?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
