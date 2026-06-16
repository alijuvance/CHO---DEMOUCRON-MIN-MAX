import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Nom de la tâche',
    example: 'Tâche A',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la tâche (facultatif)',
    example: 'Préparation du terrain avant le début des travaux.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Durée de la tâche en unités de temps (minimum 1)',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({
    description: 'Identifiant du projet auquel cette tâche est rattachée',
    example: 1,
  })
  @IsInt()
  projectId: number;
}
