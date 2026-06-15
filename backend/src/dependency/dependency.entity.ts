import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Check } from 'typeorm';
import { Task } from '../task/task.entity';
import { Project } from '../project/project.entity';

@Entity('dependencies')
@Check(`"source_task_id" <> "target_task_id"`)
export class Dependency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'source_task_id' })
  sourceTaskId: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source_task_id' })
  sourceTask: Task;

  @Column({ name: 'target_task_id' })
  targetTaskId: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_task_id' })
  targetTask: Task;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => Project, project => project.dependencies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
