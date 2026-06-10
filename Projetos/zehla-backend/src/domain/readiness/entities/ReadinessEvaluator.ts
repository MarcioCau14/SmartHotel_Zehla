import { Result } from '../../shared/Result';
import { PIIScanner } from '../../security/services/PIIScanner';

export interface ReadinessAnswers {
  hasPMS: boolean;
  hasChannelManager: boolean;
  hasBookingEngine: boolean;
  hasWhatsAppAutomation: boolean;
  hasReviewAutomation: boolean;
  hasConsolidatedDatabase: boolean;
  hasHistoricalData: boolean;
  teamOpenToAI: boolean;
  teamTrained: boolean;
  hasLgpdConsent: boolean;
  hasLgpdDeletionProcess: boolean;
  hasSecureDataStorage: boolean;
  propertyName?: string;
  notes?: string;
}

export type MaturityCategory = 'Co-Pilots' | 'Brains' | 'Autonomous Agents';
export type LgpdRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ReadinessAssessment {
  score: number;
  category: MaturityCategory;
  lgpdRisk: LgpdRiskLevel;
  recommendations: string[];
  propertyName: string;
  evaluatedAt: Date;
}

export class ReadinessEvaluator {
  static evaluate(answers: ReadinessAnswers): Result<ReadinessAssessment, Error> {
    try {
      let propertyName = answers.propertyName || 'Pousada';
      let notes = answers.notes || '';

      if (notes) {
        const { tokenized } = PIIScanner.tokenize(notes);
        notes = tokenized;
      }
      
      if (propertyName) {
        const { tokenized } = PIIScanner.tokenize(propertyName);
        propertyName = tokenized;
      }

      let scorePoints = 0;

      if (answers.hasPMS) scorePoints += 15;
      if (answers.hasChannelManager) scorePoints += 15;
      if (answers.hasBookingEngine) scorePoints += 10;
      if (answers.hasWhatsAppAutomation) scorePoints += 15;
      if (answers.hasReviewAutomation) scorePoints += 10;
      if (answers.hasConsolidatedDatabase) scorePoints += 10;
      if (answers.hasHistoricalData) scorePoints += 10;
      if (answers.teamOpenToAI) scorePoints += 10;
      if (answers.teamTrained) scorePoints += 5;

      const score = Math.min(scorePoints, 100);

      let category: MaturityCategory = 'Co-Pilots';
      if (score >= 40 && score <= 75) {
        category = 'Brains';
      } else if (score > 75) {
        category = 'Autonomous Agents';
      }

      let lgpdRisk: LgpdRiskLevel = 'HIGH';
      let securePoints = 0;
      if (answers.hasLgpdConsent) securePoints++;
      if (answers.hasLgpdDeletionProcess) securePoints++;
      if (answers.hasSecureDataStorage) securePoints++;

      if (securePoints === 3) {
        lgpdRisk = 'LOW';
      } else if (securePoints === 2) {
        lgpdRisk = 'MEDIUM';
      }

      const recommendations: string[] = [];
      if (!answers.hasPMS) {
        recommendations.push('Implementar um PMS para centralização dos dados operacionais da propriedade.');
      }
      if (!answers.hasWhatsAppAutomation) {
        recommendations.push('Ativar canal de auto-atendimento de WhatsApp para triagem de reservas do Dia-1.');
      }
      if (!answers.hasLgpdConsent || !answers.hasSecureDataStorage) {
        recommendations.push('Criar termo de consentimento explícito e revisão do armazenamento de dados dos hóspedes (LGPD).');
      }
      if (category === 'Co-Pilots') {
        recommendations.push('Focar no Quick Day-1 Wins: automação de templates de mensagens básicas.');
      } else if (category === 'Brains') {
        recommendations.push('Avançar para precificação dinâmica autônoma com o motor de Revenue.');
      } else {
        recommendations.push('Efetivar check-in sem recepção física e agentes autônomos integrados ao PMS.');
      }

      const assessment: ReadinessAssessment = Object.freeze({
        score,
        category,
        lgpdRisk,
        recommendations,
        propertyName,
        evaluatedAt: new Date()
      });

      return Result.ok(assessment);
    } catch (err: any) {
      return Result.fail(err instanceof Error ? err : new Error(err.message || 'Unknown evaluation error'));
    }
  }
}
