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
    const project = await this.repo.findOne({ where: { id }, relations: { tasks: true, dependencies: true } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}