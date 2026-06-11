import { Result } from '../../shared/Result';

export interface RoiInput {
  roomsCount: number;
  averageDailyRate: number; // ADR (R$)
  currentOccupancy: number; // Percentual (0-100)
  staffAverageHourlyRate: number; // R$/hora médio
}

export interface RoiPrediction {
  occupancyBoostPercent: number;
  occupancyRevenueGain: number;
  otaCommissionSavings: number;
  staffTimeSavedHours: number;
  staffCostSavings: number;
  totalMonthlyGain: number;
  totalYearlyGain: number;
}

export class RoiPredictor {
  static predict(input: RoiInput): Result<RoiPrediction, Error> {
    try {
      if (input.roomsCount <= 0 || input.averageDailyRate <= 0) {
        return Result.fail(new Error('roomsCount and averageDailyRate must be positive values'));
      }

      const currentOccupancyDecimal = Math.max(0, Math.min(100, input.currentOccupancy)) / 100;

      // 1. Aumento de Ocupação estimado (estimativa conservadora de 5% a 15% a mais)
      // Se a ocupação atual for baixa, o potencial de ganho é maior.
      let occupancyBoostPercent = 8.0; // Padrão
      if (currentOccupancyDecimal < 0.4) {
        occupancyBoostPercent = 12.0;
      } else if (currentOccupancyDecimal > 0.8) {
        occupancyBoostPercent = 4.0;
      }

      // Receita mensal atual aproximada = quartos * 30 dias * ocupacao * diária
      const daysInMonth = 30;
      const totalRoomsAvailable = input.roomsCount * daysInMonth;
      const currentMonthlyRevenue = totalRoomsAvailable * currentOccupancyDecimal * input.averageDailyRate;

      // Ganho por aumento de ocupação
      const occupancyRevenueGain = totalRoomsAvailable * (occupancyBoostPercent / 100) * input.averageDailyRate;

      // 2. Economia com comissões de OTAs (Booking, Expedia etc. cobram ~15%)
      // Estimamos que a IA recupera 15% das reservas comissionadas direcionando para reservas diretas via Pix.
      // E dessas diretas, economiza a taxa de 15% comissionada.
      const otaCommissionSavings = currentMonthlyRevenue * 0.5 * 0.15 * 0.15; // 50% dependência * 15% de recuperação * 15% comissão

      // 3. Tempo economizado da equipe (estimativa de 30 minutos por dia para cada 5 quartos gerenciados)
      const dailyTimeSavedMinutes = (input.roomsCount / 5) * 30;
      const staffTimeSavedHours = parseFloat(((dailyTimeSavedMinutes * daysInMonth) / 60).toFixed(1));
      const staffCostSavings = staffTimeSavedHours * input.staffAverageHourlyRate;

      // 4. Totais
      const totalMonthlyGain = Math.round(occupancyRevenueGain + otaCommissionSavings + staffCostSavings);
      const totalYearlyGain = totalMonthlyGain * 12;

      const prediction: RoiPrediction = Object.freeze({
        occupancyBoostPercent,
        occupancyRevenueGain: Math.round(occupancyRevenueGain),
        otaCommissionSavings: Math.round(otaCommissionSavings),
        staffTimeSavedHours,
        staffCostSavings: Math.round(staffCostSavings),
        totalMonthlyGain,
        totalYearlyGain
      });

      return Result.ok(prediction);
    } catch (err: any) {
      return Result.fail(err instanceof Error ? err : new Error(err.message || 'Unknown ROI prediction error'));
    }
  }
}
