import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisService } from './analysis.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from '../project/project.entity';
import { Task } from '../task/task.entity';
import { Dependency } from '../dependency/dependency.entity';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DemoucronEngine } from './engine/demoucron.engine';

describe('AnalysisService', () => {
  let service: AnalysisService;

  const mockProjectRepo = { findOne: jest.fn() };
  const mockTaskRepo = { find: jest.fn() };
  const mockDepRepo = { find: jest.fn() };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
        { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
        { provide: getRepositoryToken(Dependency), useValue: mockDepRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if project not found', async () => {
    mockProjectRepo.findOne.mockResolvedValue(null);
    await expect(service.runAnalysis(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw if no tasks', async () => {
    mockProjectRepo.findOne.mockResolvedValue({ id: 1 });
    mockTaskRepo.find.mockResolvedValue([]);
    await expect(service.runAnalysis(1)).rejects.toThrow(BadRequestException);
  });

  it('should process successfully', async () => {
    mockProjectRepo.findOne.mockResolvedValue({ id: 1 });
    mockTaskRepo.find.mockResolvedValue([{ id: 1, duration: 2 }]);
    mockDepRepo.find.mockResolvedValue([]);
    
    jest.spyOn(DemoucronEngine, 'run').mockReturnValue([{ id: 1, duration: 2, level: 0 } as any]);
    mockQueryRunner.manager.save.mockResolvedValue(true);

    const result = await service.runAnalysis(1);
    expect(result).toEqual([{ id: 1, duration: 2, level: 0 }]);
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });
});
