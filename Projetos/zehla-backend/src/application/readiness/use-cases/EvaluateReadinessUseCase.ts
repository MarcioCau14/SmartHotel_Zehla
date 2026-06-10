import { Result } from '../../../shared/Result';
import { ICRMRepositoryPort } from '../../../domain/crm/ports/ICRMRepositoryPort';
import { LeadProfile } from '../../../domain/crm/models/LeadProfile';
import { ReadinessEvaluator, ReadinessAnswers, ReadinessAssessment } from '../../../domain/readiness/entities/ReadinessEvaluator';
import { RoiPredictor, RoiInput, RoiPrediction } from '../../../domain/readiness/entities/RoiPredictor';
import { AgentRecommender, AgentRecommendation } from '../../../domain/readiness/entities/AgentRecommender';
import { ZehlaRouter } from '../../../domain/decision/services/ZehlaRouter';
import { playbookQueue } from '../../../lib/queues';

export interface EvaluateReadinessInput {
  propertyId: string;
  answers: ReadinessAnswers;
  roiInput: RoiInput;
}

export interface EvaluateReadinessOutput {
  assessment: ReadinessAssessment;
  roi: RoiPrediction;
  recommendations: AgentRecommendation[];
}

export class EvaluateReadinessUseCase {
  constructor(private readonly crmRepo: ICRMRepositoryPort) {}

  async execute(input: EvaluateReadinessInput): Promise<Result<EvaluateReadinessOutput, Error>> {
    try {
      const assessmentResult = ReadinessEvaluator.evaluate(input.answers);
      if (assessmentResult.isFail) {
        return Result.fail(assessmentResult.error);
      }
      const assessment = assessmentResult.value;

      const roiResult = RoiPredictor.predict(input.roiInput);
      if (roiResult.isFail) {
        return Result.fail(roiResult.error);
      }
      const roi = roiResult.value;

      const routerStats = new ZehlaRouter().getSampler().getStats();
      const recommendationsResult = AgentRecommender.recommend(
        input.answers.hasWhatsAppAutomation,
        input.answers.hasPMS,
        routerStats
      );
      if (recommendationsResult.isFail) {
        return Result.fail(recommendationsResult.error);
      }
      const recommendations = recommendationsResult.value;

      // 2. Persistir no CRM do banco de dados
      const leadResult = await this.crmRepo.buscarLeadPorPropriedade(input.propertyId);
      if (leadResult.isFail) {
        return Result.fail(leadResult.error);
      }

      let lead = leadResult.value;
      if (!lead) {
        const createResult = LeadProfile.create({
          id: `lead_readiness_${input.propertyId}_${Date.now()}`,
          nome: input.answers.propertyName || `Pousada ${input.propertyId}`,
          telefone: '000000000',
          canalOrigem: 'READINESS_ASSESSMENT',
          ltvScore: 0,
          stage: 'entrada' as any,
          createdAt: new Date(),
          propriedadeId: input.propertyId,
        });
        if (createResult.isFail) {
          return Result.fail(createResult.error);
        }
        lead = createResult.value;
      }

      const updatedLeadResult = lead.withReadiness(
        assessment.score,
        assessment.lgpdRisk,
        JSON.stringify(roi)
      );
      if (updatedLeadResult.isFail) {
        return Result.fail(updatedLeadResult.error);
      }

      const saveResult = await this.crmRepo.salvarLead(updatedLeadResult.value);
      if (saveResult.isFail) {
        return Result.fail(saveResult.error);
      }

      // 3. Enfileirar a geração assíncrona do Playbook no BullMQ
      await playbookQueue.add('generate-playbook', {
        propertyId: input.propertyId,
        assessment,
        roi,
        recommendations
      });

      return Result.ok({
        assessment,
        roi,
        recommendations
      });
    } catch (err: any) {
      return Result.fail(err instanceof Error ? err : new Error(err.message || 'Erro desconhecido na orquestração da avaliação'));
    }
  }
}
