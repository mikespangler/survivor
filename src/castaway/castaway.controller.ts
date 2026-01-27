import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CastawayService } from './castaway.service';
import { CreateCastawayDto } from './dto/create-castaway.dto';
import { UpdateCastawayDto } from './dto/update-castaway.dto';
import { SystemAdminGuard } from '../auth/guards/system-admin.guard';
import { uploadConfig } from './upload.config';

@Controller('castaways')
export class CastawayController {
  constructor(private readonly castawayService: CastawayService) {}

  @Get()
  findAll(@Query('seasonId') seasonId: string) {
    return this.castawayService.findAll(seasonId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.castawayService.findOne(id);
  }

  @Post()
  @UseGuards(SystemAdminGuard)
  create(@Body() createCastawayDto: CreateCastawayDto) {
    return this.castawayService.create(createCastawayDto);
  }

  @Patch(':id')
  @UseGuards(SystemAdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateCastawayDto: UpdateCastawayDto,
  ) {
    return this.castawayService.update(id, updateCastawayDto);
  }

  @Delete(':id')
  @UseGuards(SystemAdminGuard)
  remove(@Param('id') id: string) {
    return this.castawayService.remove(id);
  }

  @Post(':id/image')
  @UseGuards(SystemAdminGuard)
  @UseInterceptors(FileInterceptor('image', uploadConfig))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.castawayService.uploadImage(id, file);
  }

  @Delete(':id/image')
  @UseGuards(SystemAdminGuard)
  async deleteImage(@Param('id') id: string) {
    return this.castawayService.deleteImage(id);
  }
}
