import { Result } from '../../../domain/shared/Result';
import { PousadaFinance } from '../../../domain/financeiro/entities/PousadaFinance';
import { IPousadaFinanceRepository } from '../ports/IPousadaFinanceRepository';
import { IFinanceTransactionRepository } from '../ports/IFinanceTransactionRepository';
import { IFinanceAlertRepository } from '../ports/IFinanceAlertRepository';
import { FinanceAgentsService } from '../services/FinanceAgentsService';
import { prisma } from '@/lib/prisma';

export interface ObterDashboardInput {
  propertyId: string;
  days?: number;
}

export interface ObterDashboardOutput {
  period: number;
  summary: {
    totalRevenue: number;
    totalCosts: number;
    profit: number;
    profitMargin: number;
    avgOccupancy: number;
    avgADR: number;
    avgRevPAR: number;
  };
  chartData: Array<{
    date: string;
    revenue: number;
    costs: number;
    occupancy: number;
    adr: number;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    createdAt: Date;
  }>;
  aiInsight: string;
  healthScore: number;
}

export class ObterDashboardFinanceiroUseCase {
  constructor(
    private pousadaFinanceRepo: IPousadaFinanceRepository,
    private transactionRepo: IFinanceTransactionRepository,
    private alertRepo: IFinanceAlertRepository
  ) {}

  async execute(input: ObterDashboardInput): Promise<Result<ObterDashboardOutput, Error>> {
    const { propertyId, days = 30 } = input;

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // 1. Garantir que temos registros consolidados de PousadaFinance para cada dia no intervalo
      // (Consolidação On-Demand para evitar dashboards vazios)
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { rooms: true },
      });

      if (!property) {
        return Result.fail(new Error('PROPRIEDADE_NAO_ENCONTRADA'));
      }

      const totalRoomsCount = property.rooms.length || 10;

      for (let i = 0; i <= days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);

        const existing = await this.pousadaFinanceRepo.findUnique(propertyId, currentDate);
        if (!existing) {
          // Calcula transações para esse dia específico
          const nextDay = new Date(currentDate);
          nextDay.setDate(currentDate.getDate() + 1);

          const transactions = await prisma.financeTransaction.findMany({
            where: {
              propertyId,
              date: { gte: currentDate, lt: nextDay },
            },
          });

          let grossRevenue = 0;
          let totalCosts = 0;
          const channelBreakdown: Record<string, number> = {};
          const operatingCosts: Record<string, number> = {};

          transactions.forEach((tx) => {
            if (tx.type === 'INCOME') {
              grossRevenue += tx.amount;
              const ch = tx.channel || 'direto';
              channelBreakdown[ch] = (channelBreakdown[ch] || 0) + tx.amount;
            } else if (tx.type === 'EXPENSE') {
              totalCosts += tx.amount;
              operatingCosts[tx.category] = (operatingCosts[tx.category] || 0) + tx.amount;
            }
          });

          // Ocupação do dia
          const occupiedReservations = await prisma.reservation.findMany({
            where: {
              propertyId,
              status: 'CONFIRMED',
              checkIn: { lte: currentDate },
              checkOut: { gt: currentDate },
            },
          });

          const occupiedRooms = Math.min(occupiedReservations.length, totalRoomsCount);
          const netRevenue = grossRevenue * 0.98; // Ex: deduz 2% comissão ZEHLA padrão

          let adr = 0;
          if (occupiedRooms > 0) {
            // Soma das diárias individuais dividida pela ocupação
            const totalRoomRevenue = occupiedReservations.reduce((sum, res) => sum + (res.roomPrice || 0), 0);
            adr = totalRoomRevenue / occupiedReservations.length;
          } else {
            adr = grossRevenue > 0 ? grossRevenue : 0;
          }

          const financeResult = PousadaFinance.create({
            id: `finance_${propertyId}_${currentDate.getTime()}`,
            propertyId,
            scope: 'CLIENT',
            date: currentDate,
            grossRevenue,
            netRevenue,
            channelBreakdown,
            totalRooms: totalRoomsCount,
            occupiedRooms,
            adr,
            operatingCosts,
            totalCosts,
            aiInsight: null,
            healthScore: null,
            alertLevel: null,
          });

          if (financeResult.isOk) {
            await this.pousadaFinanceRepo.save(financeResult.value);
          }
        }
      }

      // 2. Buscar dados consolidados reais do intervalo
      const finances = await this.pousadaFinanceRepo.findByDateRange(propertyId, startDate, endDate);

      // 3. Buscar alertas ativos não lidos
      const unreadAlerts = await this.alertRepo.findUnread(propertyId, 5);

      // 4. Se não há dados acumulados, retorna estrutura inicial vazia/padrão
      if (finances.length === 0) {
        return Result.ok({
          period: days,
          summary: {
            totalRevenue: 0,
            totalCosts: 0,
            profit: 0,
            profitMargin: 0,
            avgOccupancy: 0,
            avgADR: 0,
            avgRevPAR: 0,
          },
          chartData: [],
          alerts: [],
          aiInsight: 'Nenhum dado financeiro registrado para o período.',
          healthScore: 100,
        });
      }

      // 5. Agrega KPIs
      let totalGross = 0;
      let totalNet = 0;
      let totalCostsSum = 0;
      let sumOccupancy = 0;
      let sumADR = 0;
      let sumRevPAR = 0;

      finances.forEach((f) => {
        totalGross += f.grossRevenue;
        totalNet += f.netRevenue;
        totalCostsSum += f.totalCosts;
        sumOccupancy += f.occupancyRate;
        sumADR += f.adr;
        sumRevPAR += f.revpar;
      });

      const avgOccupancy = sumOccupancy / finances.length;
      const avgADR = sumADR / finances.length;
      const avgRevPAR = sumRevPAR / finances.length;
      const profit = totalNet - totalCostsSum;
      const profitMargin = totalNet > 0 ? (profit / totalNet) * 100 : 0;

      const summary = {
        totalRevenue: totalNet,
        totalCosts: totalCostsSum,
        profit,
        profitMargin,
        avgOccupancy,
        avgADR,
        avgRevPAR,
      };

      // 6. Formata dados do gráfico
      const chartData = finances.map((f) => ({
        date: f.date.toISOString().split('T')[0],
        revenue: f.netRevenue,
        costs: f.totalCosts,
        occupancy: f.occupancyRate,
        adr: f.adr,
      }));

      const alertMsgs = unreadAlerts.map((a) => a.message);

      // 7. Saúde Financeira (Health Score)
      // Baseado em Ocupação média e Margem de Lucro
      let healthScore = 50;
      if (avgOccupancy >= 60) healthScore += 25;
      else if (avgOccupancy >= 30) healthScore += 15;

      if (profitMargin >= 30) healthScore += 25;
      else if (profitMargin >= 10) healthScore += 15;
      else if (profitMargin < 0) healthScore -= 20;

      healthScore = Math.max(0, Math.min(100, healthScore));

      // 8. Chamar o serviço orquestrador de IA para obter o resumo de insights
      let aiInsight = '';
      const lastFinance = finances[finances.length - 1];

      if (lastFinance && lastFinance.aiInsight) {
        aiInsight = lastFinance.aiInsight;
      } else {
        // Gera via OpenAI/LLM
        aiInsight = await FinanceAgentsService.generateDailyInsight(propertyId, summary, alertMsgs);
        // Salva o insight no último registro consolidado para cache
        if (lastFinance) {
          const updatedFinance = PousadaFinance.restore({
            ...lastFinance.toJSON(),
            aiInsight,
            healthScore,
            alertLevel: healthScore >= 70 ? 'green' : healthScore >= 40 ? 'yellow' : 'red',
          });
          await this.pousadaFinanceRepo.save(updatedFinance);
        }
      }

      return Result.ok({
        period: days,
        summary,
        chartData,
        alerts: unreadAlerts.map((a) => ({
          id: a.id,
          type: a.type,
          severity: a.severity,
          message: a.message,
          createdAt: a.createdAt,
        })),
        aiInsight,
        healthScore,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('ERRO_AO_GERAR_DASHBOARD'));
    }
  }
}
