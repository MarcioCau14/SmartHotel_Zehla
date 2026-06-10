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

      let occupancyBoostPercent = 8.0;
      if (currentOccupancyDecimal < 0.4) {
        occupancyBoostPercent = 12.0;
      } else if (currentOccupancyDecimal > 0.8) {
        occupancyBoostPercent = 4.0;
      }

      const daysInMonth = 30;
      const totalRoomsAvailable = input.roomsCount * daysInMonth;
      const currentMonthlyRevenue = totalRoomsAvailable * currentOccupancyDecimal * input.averageDailyRate;

      const occupancyRevenueGain = totalRoomsAvailable * (occupancyBoostPercent / 100) * input.averageDailyRate;

      const otaCommissionSavings = currentMonthlyRevenue * 0.5 * 0.15 * 0.15;

      const dailyTimeSavedMinutes = (input.roomsCount / 5) * 30;
      const staffTimeSavedHours = parseFloat(((dailyTimeSavedMinutes * daysInMonth) / 60).toFixed(1));
      const staffCostSavings = staffTimeSavedHours * input.staffAverageHourlyRate;

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
