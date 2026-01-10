import { PartialType } from '@nestjs/mapped-types';
import { CreateCastawayDto } from './create-castaway.dto';

export class UpdateCastawayDto extends PartialType(CreateCastawayDto) {}
