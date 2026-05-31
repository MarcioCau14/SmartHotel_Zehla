/**
 * TAXA MÉDIA DE COMISSÃO DAS OTAS
 *
 * Fonte única. Antes estava duplicada em recommend-plan.ts (15%) e fish-engine.ts (22%),
 * causando contradição nos cálculos de ROI.
 *
 * Valor oficial: 18% (média ponderada do mercado brasileiro de pequenas pousadas)
 * - Booking.com: 15-18%
 * - Airbnb: 14-16%
 * - Decolar: 18-20%
 *
 * Para cálculos conservadores de ROI, usar 18%.
 */
export const OTA_COMMISSION_RATE = 0.18;

export const OTA_COMMISSION_LABEL = '18%';

export function calculateOTACommission(dailyRate: number): number {
  return dailyRate * OTA_COMMISSION_RATE;
}

export function calculateMonthlyOTACommission(
  dailyRate: number,
  monthlyDirectBookings: number
): number {
  return dailyRate * OTA_COMMISSION_RATE * monthlyDirectBookings;
}
