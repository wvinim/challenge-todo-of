import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class TasksService {
  async handlePull(lastPulledAt?: string) {
    const since = lastPulledAt ? new Date(Number(lastPulledAt)) : new Date(0);

    const changes = await prisma.task.findMany({
      where: {
        updatedAt: {
          gt: since,
        },
      },
    });

    const latestTimestamp = Date.now();

    return {
      changes: {
        tasks: changes,
      },
      timestamp: latestTimestamp,
    };
  }
}