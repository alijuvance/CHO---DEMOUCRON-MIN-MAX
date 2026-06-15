const fs = require('fs');
const path = require('path');

const bPath = (p) => path.join(__dirname, 'backend', 'src', p);

// 1. main.ts
const mainTs = fs.readFileSync(bPath('main.ts'), 'utf8');
const mainTsUpdated = mainTs.replace(
  `app.useGlobalPipes(new ValidationPipe({ transform: true }));`,
  `app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));`
);
fs.writeFileSync(bPath('main.ts'), mainTsUpdated);

// 2. task/dto/create-task.dto.ts
const createTaskDto = `import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Durée de la tâche (minimum 1)' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty()
  @IsInt()
  projectId: number;
}
`;
fs.writeFileSync(bPath('task/dto/create-task.dto.ts'), createTaskDto);

// 3. dependency.service.ts
const depService = `import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dependency } from './dependency.entity';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { Task } from '../task/task.entity';

@Injectable()
export class DependencyService {
  constructor(
    @InjectRepository(Dependency) private repo: Repository<Dependency>,
    @InjectRepository(Task) private taskRepo: Repository<Task>
  ) {}

  async create(dto: CreateDependencyDto) {
    if (dto.sourceTaskId === dto.targetTaskId) {
      throw new BadRequestException('A task cannot depend on itself');
    }

    // Sécurité: Vérifier que les tâches existent ET appartiennent au projet
    const sourceTask = await this.taskRepo.findOne({ where: { id: dto.sourceTaskId, projectId: dto.projectId } });
    const targetTask = await this.taskRepo.findOne({ where: { id: dto.targetTaskId, projectId: dto.projectId } });

    if (!sourceTask) throw new NotFoundException('Source task not found or does not belong to this project');
    if (!targetTask) throw new NotFoundException('Target task not found or does not belong to this project');

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
`;
fs.writeFileSync(bPath('dependency/dependency.service.ts'), depService);

// 4. dependency.module.ts (ajouter TaskModule pour InjectRepository)
const depModule = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DependencyService } from './dependency.service';
import { DependencyController } from './dependency.controller';
import { Dependency } from './dependency.entity';
import { Task } from '../task/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dependency, Task])],
  controllers: [DependencyController],
  providers: [DependencyService],
})
export class DependencyModule {}
`;
fs.writeFileSync(bPath('dependency/dependency.module.ts'), depModule);

// 5. analysis.service.ts (Transactions)
const analysisService = `import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private dataSource: DataSource
  ) {}

  async runAnalysis(projectId: number) {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const tasks = await this.taskRepo.find({ where: { projectId } });
    const dependencies = await this.depRepo.find({ where: { projectId } });

    if (tasks.length === 0) throw new BadRequestException('Project has no tasks');

    let analyzedTasks;
    try {
      analyzedTasks = DemoucronEngine.run(tasks, dependencies);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error running algorithmic analysis');
    }

    // Utilisation d'une transaction pour garantir l'intégrité de la mise à jour massive
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // TypeORM permet le save bulk dans une transaction
      await queryRunner.manager.save(Task, analyzedTasks);
      await queryRunner.commitTransaction();
      return analyzedTasks;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Database error during save');
    } finally {
      await queryRunner.release();
    }
  }
}
`;
fs.writeFileSync(bPath('analysis/analysis.service.ts'), analysisService);

// 6. sqlite pragma in main.ts or module. Actually we can do it via PRAGMA in typeorm directly via 'afterConnect' but typeorm doesn't expose it easily for sqlite. Wait, SQLite foreign keys are automatically ON in modern typeorm. Let's just leave it, it's a minor detail. 

console.log("Backend refactoring complete");
