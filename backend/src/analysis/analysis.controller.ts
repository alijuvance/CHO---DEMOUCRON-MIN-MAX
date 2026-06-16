import { Controller, Post, Param } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post(':projectId/run')
  @ApiOperation({
    summary: 'Exécuter l\'analyse d\'ordonnancement',
    description: 'Lance l\'analyse d\'ordonnancement (Bellman / Demoucron) pour un projet donné. '
      + 'Calcule les dates au plus tôt, au plus tard, les marges et le chemin critique.',
  })
  @ApiParam({ name: 'projectId', type: Number, description: 'Identifiant unique du projet à analyser' })
  @ApiResponse({ status: 201, description: 'L\'analyse a été exécutée avec succès. Les résultats sont retournés.' })
  @ApiResponse({ status: 404, description: 'Aucun projet trouvé avec cet identifiant.' })
  @ApiResponse({ status: 400, description: 'Le projet contient des données invalides ou un cycle dans les dépendances.' })
  runAnalysis(@Param('projectId') projectId: string) {
    return this.analysisService.runAnalysis(+projectId);
  }
}