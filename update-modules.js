const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.join(__dirname, 'backend', 'src', filePath);
  fs.writeFileSync(fullPath, content.trim());
};

write('project/project.module.ts', `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project } from './project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
`);

write('task/task.module.ts', `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
`);

write('dependency/dependency.module.ts', `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DependencyService } from './dependency.service';
import { DependencyController } from './dependency.controller';
import { Dependency } from './dependency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dependency])],
  controllers: [DependencyController],
  providers: [DependencyService],
})
export class DependencyModule {}
`);

write('analysis/analysis.module.ts', `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { Project } from '../project/project.entity';
import { Task } from '../task/task.entity';
import { Dependency } from '../dependency/dependency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Task, Dependency])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
`);

console.log("Modules updated!");
