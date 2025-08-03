import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { TasksPushDTO } from './tasks.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('push')
  async push(@Body() body: TasksPushDTO) {
    return this.tasksService.handlePush(body);
  }

  @Get('pull')
  async pull(@Query('lastPulledAt') lastPulledAt: string) {
    return this.tasksService.handlePull(lastPulledAt);
  }
}
