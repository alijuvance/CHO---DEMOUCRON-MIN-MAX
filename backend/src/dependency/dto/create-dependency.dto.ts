import { IsInt, NotEquals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDependencyDto {
  @ApiProperty()
  @IsInt()
  sourceTaskId: number;

  @ApiProperty()
  @IsInt()
  targetTaskId: number;

  @ApiProperty()
  @IsInt()
  projectId: number;
}