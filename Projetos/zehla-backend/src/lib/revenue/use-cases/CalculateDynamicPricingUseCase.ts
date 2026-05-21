import { prisma } from '@/lib/prisma';

/**
 * CalculateDynamicPricingUseCase
 * 
 * Calculates dynamic room pricing based on occupancy rate, seasonality,
 * and booking lead time.
 * 
 * Architecture:
 * 1. Occupancy-based surge pricing (primary driver)
 * 2. Day-of-week multipliers (weekends vs weekdays)
 * 3. Seasonal adjustments (high/low season)
 * 4. Lead time discounts (early bird vs last minute)
 * 
 * Phase 1: Rule-based thresholds
 * Phase 2: ML-based predictions (weather, competitor prices, events)
 */

export interface DynamicPricingInput {
  propertyId: string;
  roomId?: string;
  checkIn: Date;
  checkOut: Date;
  basePrice: number;
  totalRooms: number;
}

export interface DynamicPricingResult {
  originalPrice: number;
  finalPrice: number;
  pricePerNight: number;
  totalStay: number;
  occupancyRate: number;
  surgeMultiplier: number;
  reason: PricingReason;
  breakdown: PricingBreakdown[];
  recommendedAction: string;
}

export type PricingReason =
  | 'BASE_RATE'
  | 'HIGH_SCARCITY'
  | 'MEDIUM_DEMAND'
  | 'LOW_DEMAND_STIMULUS'
  | 'WEEKEND_PREMIUM'
  | 'SEASONAL_HIGH'
  | 'EARLY_BIRD'
  | 'LAST_MINUTE';

export interface PricingBreakdown {
  factor: string;
  multiplier: number;
  description: string;
}

export async function calculateDynamicPricing(
  input: DynamicPricingInput
): Promise<DynamicPricingResult> {
  const { propertyId, checkIn, checkOut, basePrice, totalRooms } = input;
  const breakdown: PricingBreakdown[] = [];
  let surgeMultiplier = 1.0;
  let reason: PricingReason = 'BASE_RATE';

  // 1. OCCUPANCY-BASED SURGE (Primary driver)
  const occupancyRate = await calculateOccupancyRate(propertyId, checkIn, checkOut, totalRooms);
  
  if (occupancyRate >= 0.90) {
    surgeMultiplier *= 1.30;
    reason = 'HIGH_SCARCITY';
    breakdown.push({
      factor: 'Escassez Alta',
      multiplier: 1.30,
      description: `Ocupação em ${(occupancyRate * 100).toFixed(0)}% — poucos quartos disponíveis`,
    });
  } else if (occupancyRate >= 0.70) {
    surgeMultiplier *= 1.15;
    reason = 'MEDIUM_DEMAND';
    breakdown.push({
      factor: 'Demanda Média',
      multiplier: 1.15,
      description: `Ocupação em ${(occupancyRate * 100).toFixed(0)}%`,
    });
  } else if (occupancyRate < 0.30) {
    surgeMultiplier *= 0.90;
    reason = 'LOW_DEMAND_STIMULUS';
    breakdown.push({
      factor: 'Estímulo Baixa Demanda',
      multiplier: 0.90,
      description: `Ocupação em ${(occupancyRate * 100).toFixed(0)}% — desconto para estimular reserva`,
    });
  }

  // 2. DAY-OF-WEEK MULTIPLIER
  const dayMultiplier = getDayOfWeekMultiplier(checkIn);
  if (dayMultiplier !== 1.0) {
    surgeMultiplier *= dayMultiplier;
    const isWeekend = dayMultiplier > 1.0;
    if (isWeekend && reason === 'BASE_RATE') reason = 'WEEKEND_PREMIUM';
    breakdown.push({
      factor: isWeekend ? 'Fim de Semana' : 'Dia de Semana',
      multiplier: dayMultiplier,
      description: isWeekend ? 'Sexta/Sábado — premium de demanda' : 'Segunda a Quinta — tarifa padrão',
    });
  }

  // 3. SEASONAL ADJUSTMENT
  const seasonalMultiplier = getSeasonalMultiplier(checkIn);
  if (seasonalMultiplier !== 1.0) {
    surgeMultiplier *= seasonalMultiplier;
    if (seasonalMultiplier > 1.0 && reason === 'BASE_RATE') reason = 'SEASONAL_HIGH';
    breakdown.push({
      factor: seasonalMultiplier > 1.0 ? 'Alta Temporada' : 'Baixa Temporada',
      multiplier: seasonalMultiplier,
      description: seasonalMultiplier > 1.0 ? 'Dez-Fev, Jul — alta temporada' : 'Mar-Mai, Ago-Nov — baixa temporada',
    });
  }

  // 4. LEAD TIME ADJUSTMENT
  const now = new Date();
  const daysUntilCheckIn = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const leadTimeMultiplier = getLeadTimeMultiplier(daysUntilCheckIn);
  if (leadTimeMultiplier !== 1.0) {
    surgeMultiplier *= leadTimeMultiplier;
    if (leadTimeMultiplier < 1.0 && reason === 'BASE_RATE') reason = 'EARLY_BIRD';
    if (leadTimeMultiplier > 1.0 && reason === 'BASE_RATE') reason = 'LAST_MINUTE';
    breakdown.push({
      factor: leadTimeMultiplier < 1.0 ? 'Reserva Antecipada' : 'Última Hora',
      multiplier: leadTimeMultiplier,
      description: leadTimeMultiplier < 1.0
        ? `${daysUntilCheckIn} dias de antecedência — desconto early bird`
        : `${daysUntilCheckIn} dias — premium de última hora`,
    });
  }

  // Calculate final prices
  const finalPricePerNight = Math.round(basePrice * surgeMultiplier);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const totalStay = finalPricePerNight * nights;

  // Recommended action for the AI agent
  const recommendedAction = getRecommendedAction(reason, occupancyRate, daysUntilCheckIn);

  return {
    originalPrice: basePrice,
    finalPrice: finalPricePerNight,
    pricePerNight: finalPricePerNight,
    totalStay,
    occupancyRate,
    surgeMultiplier,
    reason,
    breakdown,
    recommendedAction,
  };
}

/**
 * Calculate occupancy rate for a date range
 */
async function calculateOccupancyRate(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  totalRooms: number
): Promise<number> {
  if (totalRooms === 0) return 0;

  // Count reservations that overlap with the date range
  const overlappingReservations = await prisma.reservation.count({
    where: {
      propertyId,
      status: {
        in: ['CONFIRMED', 'CHECKED_IN'],
      },
      OR: [
        // Reservation starts during the range
        {
          checkIn: { lte: checkOut },
          checkOut: { gte: checkIn },
        },
      ],
    },
  });

  // Approximate occupancy: overlapping reservations / total rooms
  // For more accuracy, we'd calculate per-day occupancy
  return Math.min(1, overlappingReservations / totalRooms);
}

/**
 * Day of week multiplier
 * Weekends (Fri-Sat) command premium
 */
function getDayOfWeekMultiplier(checkIn: Date): number {
  const day = checkIn.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  if (day === 5 || day === 6) return 1.10; // Fri/Sat +10%
  if (day === 0) return 1.05; // Sun +5%
  return 1.0; // Mon-Thu base rate
}

/**
 * Seasonal multiplier
 * Based on Brazilian tourism seasons
 */
function getSeasonalMultiplier(checkIn: Date): number {
  const month = checkIn.getMonth() + 1; // 1-12

  // High season: Dec-Feb (summer), July (winter break)
  if (month === 12 || month === 1 || month === 2 || month === 7) {
    return 1.20; // +20%
  }

  // Shoulder season: Mar, Jun, Aug
  if (month === 3 || month === 6 || month === 8) {
    return 1.05; // +5%
  }

  // Low season: Apr-May, Sep-Nov
  return 0.95; // -5%
}

/**
 * Lead time multiplier
 * Early bookings get discounts, last-minute pay premium
 */
function getLeadTimeMultiplier(daysUntilCheckIn: number): number {
  if (daysUntilCheckIn > 60) return 0.85; // Early bird -15%
  if (daysUntilCheckIn > 30) return 0.95; // Advance -5%
  if (daysUntilCheckIn > 14) return 1.0; // Standard
  if (daysUntilCheckIn > 7) return 1.05; // Short notice +5%
  if (daysUntilCheckIn > 2) return 1.10; // Last minute +10%
  return 1.15; // Same/next day +15%
}

/**
 * Generate recommended action for the AI agent
 */
function getRecommendedAction(
  reason: PricingReason,
  occupancyRate: number,
  daysUntilCheckIn: number
): string {
  switch (reason) {
    case 'HIGH_SCARCITY':
      return 'Destaque a escassez: "Temos apenas 1-2 quartos disponíveis para essas datas. Consigo segurar o valor por 30 minutos para você fechar agora."';
    case 'MEDIUM_DEMAND':
      return 'Valorize a experiência: "Essa é uma das nossas melhores tarifas para o período. Posso incluir café da manhã especial sem custo adicional."';
    case 'LOW_DEMAND_STIMULUS':
      return 'Ofereça incentivo: "Para essas datas, consigo um desconto especial de 10% reservando hoje. Vamos garantir sua vaga?"';
    case 'WEEKEND_PREMIUM':
      return 'Justifique o premium: "O fim de semana é nosso período mais procurado. O valor inclui acesso à piscina e estacionamento gratuito."';
    case 'SEASONAL_HIGH':
      return 'Contextualize a temporada: "É alta temporada e a demanda está alta. Reservando agora garante o melhor valor antes de novos aumentos."';
    case 'EARLY_BIRD':
      return 'Reforce o desconto: "Você está reservando com boa antecedência e já garantiu o melhor valor. Posso confirmar agora?"';
    case 'LAST_MINUTE':
      return 'Urgência: "Para check-in tão próximo, temos uma última unidade disponível. Posso confirmar agora para garantir sua vaga?"';
    default:
      return 'Apresente o valor: "O valor para essas datas é de R$ X/noite. Inclui Wi-Fi, café da manhã e estacionamento. Posso confirmar sua reserva?"';
  }
}

/**
 * Get daily occupancy breakdown for a date range
 */
export async function getDailyOccupancyBreakdown(
  propertyId: string,
  startDate: Date,
  endDate: Date,
  totalRooms: number
): Promise<Array<{ date: string; occupied: number; rate: number }>> {
  const days: Array<{ date: string; occupied: number; rate: number }> = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().slice(0, 10);
    const nextDay = new Date(current);
    nextDay.setDate(nextDay.getDate() + 1);

    const occupied = await prisma.reservation.count({
      where: {
        propertyId,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        checkIn: { lte: nextDay },
        checkOut: { gte: current },
      },
    });

    days.push({
      date: dateStr,
      occupied,
      rate: totalRooms > 0 ? occupied / totalRooms : 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
}
