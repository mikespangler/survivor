import { IsArray, IsString } from 'class-validator';

export class BulkAddCastawaysDto {
  @IsArray()
  @IsString({ each: true })
  castawayIds: string[];
}
