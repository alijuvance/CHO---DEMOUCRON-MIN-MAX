import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { DependencyModule } from './dependency/dependency.module';
import { AnalysisModule } from './analysis/analysis.module';
import { Project } from './project/project.entity';
import { Task } from './task/task.entity';
import { Dependency } from './dependency/dependency.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      // @ts-ignore
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [Project, Task, Dependency],
      synchronize: true, // Auto-create tables for portability
    }),
    ProjectModule,
    TaskModule,
    DependencyModule,
    AnalysisModule,
  ],
})
export class AppModule {}
