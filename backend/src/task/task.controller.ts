import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() dto: CreateTaskDto) { return this.taskService.create(dto); }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) { return this.taskService.findByProject(+projectId); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.taskService.remove(+id); }
}