import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  @Get('me/last-viewed-league')
  async getLastViewedLeague(@CurrentUser() user: any) {
    return this.userService.getLastViewedLeague(user.id);
  }

  @Patch('me/last-viewed-league')
  async updateLastViewedLeague(
    @CurrentUser() user: any,
    @Body() body: { leagueId: string | null },
  ) {
    return this.userService.updateLastViewedLeague(user.id, body.leagueId);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }

  @Get('me/teams')
  async getCurrentUserTeams(@CurrentUser() user: any) {
    return this.userService.getUserTeams(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
