import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('push')
  async push(@Body() body: any) {
    return this.tasksService.handlePush(body);
  }

  @Get('pull')
  async pull(@Query('lastPulledAt') lastPulledAt: string) {
    return this.tasksService.handlePull(lastPulledAt);
  }
}