import { Test, TestingModule } from '@nestjs/testing';
import { DependencyService } from './dependency.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dependency } from './dependency.entity';
import { Task } from '../task/task.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DemoucronEngine } from '../analysis/engine/demoucron.engine';

describe('DependencyService', () => {
  let service: DependencyService;

  const mockDepRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockTaskRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DependencyService,
        {
          provide: getRepositoryToken(Dependency),
          useValue: mockDepRepo,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepo,
        },
      ],
    }).compile();

    service = module.get<DependencyService>(DependencyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if self dependent', async () => {
    const dto = { sourceTaskId: 1, targetTaskId: 1, projectId: 1 };
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw if tasks not found', async () => {
    const dto = { sourceTaskId: 1, targetTaskId: 2, projectId: 1 };
    mockTaskRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('should create dependency successfully', async () => {
    const dto = { sourceTaskId: 1, targetTaskId: 2, projectId: 1 };
    mockTaskRepo.findOne.mockResolvedValue({ id: 1 }); // source
    mockTaskRepo.findOne.mockResolvedValue({ id: 2 }); // target
    mockDepRepo.findOne.mockResolvedValue(null);
    mockTaskRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockDepRepo.find.mockResolvedValue([]);
    mockDepRepo.create.mockReturnValue(dto);
    mockDepRepo.save.mockResolvedValue({ id: 1, ...dto });

    jest.spyOn(DemoucronEngine, 'detectCycle').mockReturnValue(false);

    const result = await service.create(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should throw if cycle detected', async () => {
    const dto = { sourceTaskId: 1, targetTaskId: 2, projectId: 1 };
    mockTaskRepo.findOne.mockResolvedValue({ id: 1 });
    mockDepRepo.findOne.mockResolvedValue(null);
    mockTaskRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockDepRepo.find.mockResolvedValue([]);
    mockDepRepo.create.mockReturnValue(dto);

    jest.spyOn(DemoucronEngine, 'detectCycle').mockReturnValue(true);

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });
});
