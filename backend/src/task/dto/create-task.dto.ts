import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Durée de la tâche (minimum 1)' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty()
  @IsInt()
  projectId: number;
}
