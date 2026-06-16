import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une tâche', description: 'Crée une nouvelle tâche et l\'associe à un projet existant.' })
  @ApiResponse({ status: 201, description: 'La tâche a été créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides fournies dans la requête.' })
  create(@Body() dto: CreateTaskDto) {
    return this.taskService.create(dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Lister les tâches d\'un projet', description: 'Récupère toutes les tâches associées à un projet spécifique.' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Identifiant unique du projet dont on souhaite récupérer les tâches' })
  @ApiResponse({ status: 200, description: 'Liste des tâches du projet retournée avec succès.' })
  @ApiResponse({ status: 404, description: 'Aucun projet trouvé avec cet identifiant.' })
  findByProject(@Param('projectId') projectId: string) {
    return this.taskService.findByProject(+projectId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une tâche', description: 'Supprime une tâche existante ainsi que toutes ses dépendances associées.' })
  @ApiParam({ name: 'id', type: Number, description: 'Identifiant unique de la tâche à supprimer' })
  @ApiResponse({ status: 200, description: 'La tâche a été supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Aucune tâche trouvée avec cet identifiant.' })
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
}