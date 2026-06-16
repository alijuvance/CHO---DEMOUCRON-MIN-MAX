import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { DependencyService } from './dependency.service';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('dependencies')
@Controller('dependencies')
export class DependencyController {
  constructor(private readonly dependencyService: DependencyService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une dépendance', description: 'Crée une nouvelle dépendance entre deux tâches au sein d\'un même projet.' })
  @ApiResponse({ status: 201, description: 'La dépendance a été créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides fournies dans la requête.' })
  create(@Body() dto: CreateDependencyDto) {
    return this.dependencyService.create(dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Lister les dépendances d\'un projet', description: 'Récupère toutes les dépendances entre tâches pour un projet spécifique.' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Identifiant unique du projet dont on souhaite récupérer les dépendances' })
  @ApiResponse({ status: 200, description: 'Liste des dépendances du projet retournée avec succès.' })
  @ApiResponse({ status: 404, description: 'Aucun projet trouvé avec cet identifiant.' })
  findByProject(@Param('projectId') projectId: string) {
    return this.dependencyService.findByProject(+projectId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une dépendance', description: 'Supprime une dépendance existante entre deux tâches.' })
  @ApiParam({ name: 'id', type: Number, description: 'Identifiant unique de la dépendance à supprimer' })
  @ApiResponse({ status: 200, description: 'La dépendance a été supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Aucune dépendance trouvée avec cet identifiant.' })
  remove(@Param('id') id: string) {
    return this.dependencyService.remove(+id);
  }
}