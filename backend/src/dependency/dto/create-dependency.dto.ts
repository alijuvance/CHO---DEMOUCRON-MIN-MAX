import { IsInt, NotEquals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDependencyDto {
  @ApiProperty({
    description: 'Identifiant de la tâche source (prédécesseur)',
    example: 1,
  })
  @IsInt()
  sourceTaskId: number;

  @ApiProperty({
    description: 'Identifiant de la tâche cible (successeur)',
    example: 2,
  })
  @IsInt()
  targetTaskId: number;

  @ApiProperty({
    description: 'Identifiant du projet auquel cette dépendance appartient',
    example: 1,
  })
  @IsInt()
  projectId: number;
}