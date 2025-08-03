import { Controller, Get, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('pull')
  async pull(@Query('lastPulledAt') lastPulledAt: string) {
    return this.tasksService.handlePull(lastPulledAt);
  }
}