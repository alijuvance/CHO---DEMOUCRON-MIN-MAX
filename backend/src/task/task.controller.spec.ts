import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

describe('TaskController', () => {
  let controller: TaskController;

  const mockTaskService = {
    create: jest.fn(),
    findByProject: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskService, useValue: mockTaskService }],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', () => {
    const dto = { name: 'T1', duration: 1, projectId: 1 };
    controller.create(dto);
    expect(mockTaskService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findByProject', () => {
    controller.findByProject('1');
    expect(mockTaskService.findByProject).toHaveBeenCalledWith(1);
  });

  it('should call remove', () => {
    controller.remove('1');
    expect(mockTaskService.remove).toHaveBeenCalledWith(1);
  });
});
