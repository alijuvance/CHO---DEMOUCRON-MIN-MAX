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