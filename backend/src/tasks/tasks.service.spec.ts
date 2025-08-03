/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma.service';
import { timestamp } from 'rxjs';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> = {
      task: {
        upsert: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      deletedTask: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  describe('handlePush', () => {
    it('deve fazer upsert de tarefas criadas e atualizadas, e registrar tarefas deletadas', async () => {
      const data = {
        created: [
          {
            id: '1',
            title: 'Criada',
            description: 'Descrição',
            done: false,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        updated: [
          {
            id: '2',
            title: 'Atualizada',
            description: 'Atualização',
            done: true,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        deleted: ['3'],
      };

      await service.handlePush(data);

      expect(prisma.task.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.deletedTask.create).toHaveBeenCalledWith({
        data: { id: '3' },
      });
    });
  });

  describe('handlePull', () => {
    it('deve retornar tarefas modificadas após uma data e ids deletados', async () => {
      const lastPulledAt = new Date().toISOString();

      const mockTasks = [
        {
          id: '1',
          title: 'Task',
          description: 'Desc',
          done: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];

      const mockDeleted = [{ id: '3' }];

      prisma.task.findMany.mockResolvedValue(mockTasks);
      prisma.deletedTask.findMany.mockResolvedValue(mockDeleted);

      const result = await service.handlePull(lastPulledAt);

      expect(prisma.task.findMany).toHaveBeenCalled();
      expect(prisma.deletedTask.findMany).toHaveBeenCalled();
      expect(result).toMatchObject({
        changes: {
          tasks: mockTasks,
          tasks_deleted: ['3']
        }
      });
    });
  });
});