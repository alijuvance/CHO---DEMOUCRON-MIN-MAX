import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    if (!project) throw new NotFoundException('Projet introuvable');

    const tasks = await this.taskRepo.find({ where: { projectId } });
    const dependencies = await this.depRepo.find({ where: { projectId } });

    if (tasks.length === 0) throw new BadRequestException('Le projet ne contient aucune tâche');

    let analyzedTasks;
    try {
      analyzedTasks = DemoucronEngine.run(tasks, dependencies);
    } catch (error: any) {
      throw new BadRequestException(error.message || "Erreur lors de l'analyse algorithmique");
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
      throw new BadRequestException("Erreur de base de données lors de l'enregistrement");
    } finally {
      await queryRunner.release();
    }
  }
}
