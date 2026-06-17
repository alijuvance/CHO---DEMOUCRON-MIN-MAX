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
      type: process.env.DATABASE_TYPE || 'better-sqlite3',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'password',
      database: process.env.DATABASE_TYPE === 'postgres' ? (process.env.DATABASE_NAME || 'demoucron_db') : 'database.sqlite',
      entities: [Project, Task, Dependency],
      synchronize: true, // Use migrations in real prod, true is OK here for auto-schema
    }),
    ProjectModule,
    TaskModule,
    DependencyModule,
    AnalysisModule,
  ],
})
export class AppModule {}
