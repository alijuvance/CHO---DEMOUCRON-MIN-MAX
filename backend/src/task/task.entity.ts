import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int', nullable: true })
  level: number | null;

  @Column({ type: 'float', name: 'earliest_start', nullable: true })
  earliestStart: number | null;

  @Column({ type: 'float', name: 'earliest_finish', nullable: true })
  earliestFinish: number | null;

  @Column({ type: 'float', name: 'latest_start', nullable: true })
  latestStart: number | null;

  @Column({ type: 'float', name: 'latest_finish', nullable: true })
  latestFinish: number | null;

  @Column({ type: 'float', name: 'total_margin', nullable: true })
  totalMargin: number | null;

  @Column({ type: 'float', name: 'free_margin', nullable: true })
  freeMargin: number | null;

  @Column({ type: 'boolean', name: 'is_critical', default: false })
  isCritical: boolean;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => Project, project => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
