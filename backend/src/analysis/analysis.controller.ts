import { Controller, Post, Param } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post(':projectId/run')
  runAnalysis(@Param('projectId') projectId: string) {
    return this.analysisService.runAnalysis(+projectId);
  }
}