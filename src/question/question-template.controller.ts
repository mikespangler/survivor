import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionTemplateDto, UpdateQuestionTemplateDto } from './dto';
import { SystemAdminGuard } from '../auth/guards/system-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('question-templates')
@UseGuards(SystemAdminGuard)
export class QuestionTemplateController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  async getTemplates(@Query('category') category?: string) {
    return this.questionService.getTemplates(category);
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.questionService.getTemplate(id);
  }

  @Post()
  async createTemplate(
    @CurrentUser() user: any,
    @Body() dto: CreateQuestionTemplateDto,
  ) {
    return this.questionService.createTemplate(user.id, dto);
  }

  @Patch(':id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionTemplateDto,
  ) {
    return this.questionService.updateTemplate(id, dto);
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string) {
    return this.questionService.deleteTemplate(id);
  }
}
