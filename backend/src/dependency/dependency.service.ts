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
      throw new BadRequestException("Une tâche ne peut pas dépendre d'elle-même");
    }

    // Sécurité: Vérifier que les tâches existent ET appartiennent au projet
    const sourceTask = await this.taskRepo.findOne({ where: { id: dto.sourceTaskId, projectId: dto.projectId } });
    const targetTask = await this.taskRepo.findOne({ where: { id: dto.targetTaskId, projectId: dto.projectId } });

    if (!sourceTask) throw new NotFoundException("La tâche source est introuvable ou n'appartient pas à ce projet");
    if (!targetTask) throw new NotFoundException("La tâche cible est introuvable ou n'appartient pas à ce projet");

    const exists = await this.repo.findOne({ where: { sourceTaskId: dto.sourceTaskId, targetTaskId: dto.targetTaskId }});
    if (exists) throw new BadRequestException('Cette dépendance existe déjà');

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
