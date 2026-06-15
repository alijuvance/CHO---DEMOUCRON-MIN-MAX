import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { DependencyService } from './dependency.service';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dependencies')
@Controller('dependencies')
export class DependencyController {
  constructor(private readonly dependencyService: DependencyService) {}

  @Post()
  create(@Body() dto: CreateDependencyDto) { return this.dependencyService.create(dto); }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) { return this.dependencyService.findByProject(+projectId); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.dependencyService.remove(+id); }
}