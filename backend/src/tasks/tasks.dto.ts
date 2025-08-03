import { Task } from '@prisma/client';

export type TasksPushDTO = {
  created: Task[];
  updated: Task[];
  deleted: string[];
};
