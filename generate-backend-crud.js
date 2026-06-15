const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.join(__dirname, 'backend', 'src', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
};

// --- PROJECT ---
write('project/dto/create-project.dto.ts', `
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Projet A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
`);

write('project/project.service.ts', `
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(Project) private repo: Repository<Project>) {}

  create(dto: CreateProjectDto) {
    const project = this.repo.create(dto);
    return this.repo.save(project);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const project = await this.repo.findOne({ where: { id }, relations: ['tasks', 'dependencies'] });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
`);

write('project/project.controller.ts', `
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() dto: CreateProjectDto) { return this.projectService.create(dto); }

  @Get()
  findAll() { return this.projectService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.projectService.findOne(+id); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.projectService.remove(+id); }
}
`);

// --- TASK ---
write('task/dto/create-task.dto.ts', `
import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty()
  @IsInt()
  projectId: number;
}
`);

write('task/task.service.ts', `
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
  constructor(@InjectRepository(Task) private repo: Repository<Task>) {}

  create(dto: CreateTaskDto) {
    const task = this.repo.create(dto);
    return this.repo.save(task);
  }

  findByProject(projectId: number) {
    return this.repo.find({ where: { projectId } });
  }

  async remove(id: number) {
    return this.repo.delete(id);
  }
}
`);

write('task/task.controller.ts', `
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() dto: CreateTaskDto) { return this.taskService.create(dto); }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) { return this.taskService.findByProject(+projectId); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.taskService.remove(+id); }
}
`);

// --- DEPENDENCY ---
write('dependency/dto/create-dependency.dto.ts', `
import { IsInt, NotEquals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDependencyDto {
  @ApiProperty()
  @IsInt()
  sourceTaskId: number;

  @ApiProperty()
  @IsInt()
  targetTaskId: number;

  @ApiProperty()
  @IsInt()
  projectId: number;
}
`);

write('dependency/dependency.service.ts', `
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dependency } from './dependency.entity';
import { CreateDependencyDto } from './dto/create-dependency.dto';

@Injectable()
export class DependencyService {
  constructor(@InjectRepository(Dependency) private repo: Repository<Dependency>) {}

  async create(dto: CreateDependencyDto) {
    if (dto.sourceTaskId === dto.targetTaskId) {
      throw new BadRequestException('A task cannot depend on itself');
    }
    const exists = await this.repo.findOne({ where: { sourceTaskId: dto.sourceTaskId, targetTaskId: dto.targetTaskId }});
    if (exists) throw new BadRequestException('Dependency already exists');

    const dependency = this.repo.create(dto);
    return this.repo.save(dependency);
  }

  findByProject(projectId: number) {
    return this.repo.find({ where: { projectId } });
  }

  async remove(id: number) {
    return this.repo.delete(id);
  }
}
`);

write('dependency/dependency.controller.ts', `
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { DependencyService } from './dependency.service';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dependencies')
@Controller('dependencies')
export class DependencyController {
  constructor(private readonly dependencyService: DependencyService) {}

  @Post()
  create(@Body() dto: CreateDependencyDto) { return this.dependencyService.create(dto); }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) { return this.dependencyService.findByProject(+projectId); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.dependencyService.remove(+id); }
}
`);

// --- ANALYSIS ---
write('analysis/analysis.service.ts', `
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../project/project.entity';
import { Task } from '../task/task.entity';
import { Dependency } from '../dependency/dependency.entity';
import { DemoucronEngine } from './engine/demoucron.engine';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Dependency) private depRepo: Repository<Dependency>,
  ) {}

  async runAnalysis(projectId: number) {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const tasks = await this.taskRepo.find({ where: { projectId } });
    const dependencies = await this.depRepo.find({ where: { projectId } });

    if (tasks.length === 0) throw new BadRequestException('Project has no tasks');

    try {
      const analyzedTasks = DemoucronEngine.run(tasks, dependencies);
      // Save results
      await this.taskRepo.save(analyzedTasks);
      return analyzedTasks;
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error running analysis');
    }
  }
}
`);

write('analysis/analysis.controller.ts', `
import { Controller, Post, Param } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post(':projectId/run')
  runAnalysis(@Param('projectId') projectId: string) {
    return this.analysisService.runAnalysis(+projectId);
  }
}
`);

console.log("CRUD files generated successfully!");
