import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SystemAdminGuard } from '../auth/guards/system-admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(SystemAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 50;
    return this.adminService.getAllUsers(skipNum, takeNum);
  }

  @Get('leagues')
  async getAllLeagues(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 50;
    return this.adminService.getAllLeagues(skipNum, takeNum);
  }

  @Get('leagues/:id')
  async getAnyLeague(@Param('id') id: string) {
    return this.adminService.getAnyLeague(id);
  }
}
