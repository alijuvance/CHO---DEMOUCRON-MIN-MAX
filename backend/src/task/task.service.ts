import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

import { Project } from '../project/project.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private repo: Repository<Task>,
    @InjectRepository(Project) private projectRepo: Repository<Project>
  ) {}

  async create(dto: CreateTaskDto) {
    const project = await this.projectRepo.findOne({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');
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