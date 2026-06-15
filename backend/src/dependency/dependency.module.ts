import { Module } from '@nestjs/common';
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
