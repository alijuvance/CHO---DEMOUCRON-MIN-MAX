import { Test, TestingModule } from '@nestjs/testing';
import { DependencyController } from './dependency.controller';
import { DependencyService } from './dependency.service';

describe('DependencyController', () => {
  let controller: DependencyController;

  const mockDependencyService = {
    create: jest.fn(),
    findByProject: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DependencyController],
      providers: [{ provide: DependencyService, useValue: mockDependencyService }],
    }).compile();

    controller = module.get<DependencyController>(DependencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', () => {
    const dto = { sourceTaskId: 1, targetTaskId: 2, projectId: 1 };
    controller.create(dto);
    expect(mockDependencyService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findByProject', () => {
    controller.findByProject('1');
    expect(mockDependencyService.findByProject).toHaveBeenCalledWith(1);
  });

  it('should call remove', () => {
    controller.remove('1');
    expect(mockDependencyService.remove).toHaveBeenCalledWith(1);
  });
});
