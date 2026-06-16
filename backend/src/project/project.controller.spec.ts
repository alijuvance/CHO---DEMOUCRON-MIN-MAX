import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

describe('ProjectController', () => {
  let controller: ProjectController;

  const mockProjectService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [{ provide: ProjectService, useValue: mockProjectService }],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', () => {
    const dto = { name: 'P' };
    controller.create(dto);
    expect(mockProjectService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll', () => {
    controller.findAll();
    expect(mockProjectService.findAll).toHaveBeenCalled();
  });

  it('should call findOne', () => {
    controller.findOne('1');
    expect(mockProjectService.findOne).toHaveBeenCalledWith(1);
  });

  it('should call remove', () => {
    controller.remove('1');
    expect(mockProjectService.remove).toHaveBeenCalledWith(1);
  });
});
