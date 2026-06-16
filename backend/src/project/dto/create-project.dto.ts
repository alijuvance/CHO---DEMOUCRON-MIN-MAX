import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Nom du projet',
    example: 'Projet A',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du projet (facultatif)',
    example: 'Ce projet concerne la planification du chantier principal.',
  })
  @IsString()
  @IsOptional()
  description?: string;
}