import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Project } from '../project/project.entity';
import { NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;

  const mockTaskRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockProjectRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepo,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepo,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a task', async () => {
    const dto = { name: 'A', duration: 3, projectId: 1 };
    mockProjectRepo.findOne.mockResolvedValue({ id: 1 });
    mockTaskRepo.create.mockReturnValue(dto);
    mockTaskRepo.save.mockResolvedValue({ id: 1, ...dto });

    const result = await service.create(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should throw if project not found when creating task', async () => {
    const dto = { name: 'A', duration: 3, projectId: 99 };
    mockProjectRepo.findOne.mockResolvedValue(null);
    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('should find tasks by project', async () => {
    mockTaskRepo.find.mockResolvedValue([{ id: 1, name: 'A' }]);
    const result = await service.findByProject(1);
    expect(result).toEqual([{ id: 1, name: 'A' }]);
  });

  it('should remove a task', async () => {
    mockTaskRepo.delete.mockResolvedValue({ affected: 1 });
    const result = await service.remove(1);
    expect(result).toEqual({ affected: 1 });
  });
});
