import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un projet', description: 'Crée un nouveau projet de planification.' })
  @ApiResponse({ status: 201, description: 'Le projet a été créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides fournies dans la requête.' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les projets', description: 'Récupère la liste complète de tous les projets existants.' })
  @ApiResponse({ status: 200, description: 'Liste des projets retournée avec succès.' })
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un projet par ID', description: 'Récupère les détails d\'un projet spécifique à partir de son identifiant.' })
  @ApiParam({ name: 'id', type: Number, description: 'Identifiant unique du projet' })
  @ApiResponse({ status: 200, description: 'Le projet a été trouvé et retourné avec succès.' })
  @ApiResponse({ status: 404, description: 'Aucun projet trouvé avec cet identifiant.' })
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un projet', description: 'Supprime un projet existant ainsi que toutes ses tâches et dépendances associées.' })
  @ApiParam({ name: 'id', type: Number, description: 'Identifiant unique du projet à supprimer' })
  @ApiResponse({ status: 200, description: 'Le projet a été supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Aucun projet trouvé avec cet identifiant.' })
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}