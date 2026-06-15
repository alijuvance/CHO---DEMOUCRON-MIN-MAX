import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
