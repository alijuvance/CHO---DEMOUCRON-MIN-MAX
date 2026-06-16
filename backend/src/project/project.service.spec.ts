import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProjectService', () => {
  let service: ProjectService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a project', async () => {
    const dto = { name: 'Test', description: 'Test Desc' };
    mockRepo.create.mockReturnValue(dto);
    mockRepo.save.mockResolvedValue({ id: 1, ...dto });

    const result = await service.create(dto);
    expect(result).toEqual({ id: 1, ...dto });
    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(mockRepo.save).toHaveBeenCalledWith(dto);
  });

  it('should find all projects', async () => {
    mockRepo.find.mockResolvedValue([{ id: 1, name: 'P1' }]);
    const result = await service.findAll();
    expect(result).toEqual([{ id: 1, name: 'P1' }]);
  });

  it('should find one project', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 1, name: 'P1' });
    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1, name: 'P1' });
  });

  it('should throw if project not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should remove a project', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 1, name: 'P1' });
    mockRepo.delete.mockResolvedValue({ affected: 1 });
    const result = await service.remove(1);
    expect(result).toEqual({ affected: 1 });
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });
});
