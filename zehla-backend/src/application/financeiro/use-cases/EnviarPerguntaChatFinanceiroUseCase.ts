import { Result } from '../../../domain/shared/Result';
import { IPousadaFinanceRepository } from '../ports/IPousadaFinanceRepository';
import { FinanceAgentsService } from '../services/FinanceAgentsService';

export interface EnviarPerguntaChatInput {
  propertyId: string;
  message: string;
}

export interface EnviarPerguntaChatOutput {
  reply: string;
}

export class EnviarPerguntaChatFinanceiroUseCase {
  constructor(private pousadaFinanceRepo: IPousadaFinanceRepository) {}

  async execute(input: EnviarPerguntaChatInput): Promise<Result<EnviarPerguntaChatOutput, Error>> {
    const { propertyId, message } = input;

    try {
      if (!message || message.trim().length === 0) {
        return Result.fail(new Error('MENSAGEM_OBRIGATORIA'));
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      // Busca dados consolidados recentes (últimos 30 dias)
      const finances = await this.pousadaFinanceRepo.findByDateRange(propertyId, startDate, endDate);

      // Agrega KPIs para dar de contexto à IA
      let totalNet = 0;
      let totalCostsSum = 0;
      let sumOccupancy = 0;
      let sumADR = 0;
      let sumRevPAR = 0;

      if (finances.length > 0) {
        finances.forEach((f) => {
          totalNet += f.netRevenue;
          totalCostsSum += f.totalCosts;
          sumOccupancy += f.occupancyRate;
          sumADR += f.adr;
          sumRevPAR += f.revpar;
        });

        const count = finances.length;
        const profit = totalNet - totalCostsSum;
        const profitMargin = totalNet > 0 ? (profit / totalNet) * 100 : 0;

        const summary = {
          totalRevenue: totalNet,
          totalCosts: totalCostsSum,
          profit,
          profitMargin,
          avgOccupancy: sumOccupancy / count,
          avgADR: sumADR / count,
          avgRevPAR: sumRevPAR / count,
        };

        const reply = await FinanceAgentsService.askQuestion(propertyId, message, summary);
        return Result.ok({ reply });
      } else {
        // Sem histórico
        const summary = {
          totalRevenue: 0,
          totalCosts: 0,
          profit: 0,
          profitMargin: 0,
          avgOccupancy: 0,
          avgADR: 0,
          avgRevPAR: 0,
        };
        const reply = await FinanceAgentsService.askQuestion(propertyId, message, summary);
        return Result.ok({ reply });
      }
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('ERRO_AO_PROCESSAR_CHAT'));
    }
  }
}
