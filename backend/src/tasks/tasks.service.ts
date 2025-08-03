import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async handlePull(lastPulledAt?: string) {
    const since = lastPulledAt ? new Date(Number(lastPulledAt)) : new Date(0);

    const updatedTasks = await this.prisma.task.findMany({
      where: {
        updatedAt: {
          gt: since,
        },
      },
    });

    const deletedTasks = await this.prisma.deletedTask.findMany({
      where: {
        deletedAt: {
          gt: since,
        },
      },
      select: { id: true },
    });

    const latestTimestamp = Date.now();

    return {
      changes: {
        tasks: updatedTasks,
        tasks_deleted: deletedTasks.map((d) => d.id),
      },
      timestamp: latestTimestamp,
    };
  }

  async handlePush(body: {
    created: Task[];
    updated: Task[];
    deleted: string[];
  }) {
    const { created, updated, deleted } = body;

    const allTasks = [...created, ...updated];

    for (const task of allTasks) {
      await this.prisma.task.upsert({
        where: { id: task.id },
        create: {
          id: task.id,
          title: task.title,
          description: task.description,
          done: task.done,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        },
        update: {
          title: task.title,
          description: task.description,
          done: task.done,
          updatedAt: new Date(task.updatedAt),
        },
      });
    }

    for (const id of deleted) {
      try {
        await this.prisma.task.delete({ where: { id } });
        await this.prisma.deletedTask.create({ data: { id } });
        // eslint-disable-next-line
      } catch (e) {
        // Ignora se a tarefa já não existir
      }
    }

    return { success: true };
  }
}
