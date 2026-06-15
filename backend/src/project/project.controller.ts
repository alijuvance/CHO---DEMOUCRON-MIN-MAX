import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() dto: CreateProjectDto) { return this.projectService.create(dto); }

  @Get()
  findAll() { return this.projectService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.projectService.findOne(+id); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.projectService.remove(+id); }
}