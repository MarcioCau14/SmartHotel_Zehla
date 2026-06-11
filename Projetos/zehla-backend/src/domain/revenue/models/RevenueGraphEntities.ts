export const enum RevenueEntityType {
  PRICING_RULE = 'PricingRule',
  SEASONAL_DEMAND = 'SeasonalDemand',
  UPSELL_PATH = 'UpsellPath',
  COMPETITOR_PRICE = 'CompetitorPrice',
}

export const enum RevenueRelationType {
  PRICED_FOR = 'priced_for',
  DRIVEN_BY = 'driven_by',
  ENABLES_UPSELL = 'enables_upsell',
  COMPETES_WITH = 'competes_with',
  BUNDLED_WITH = 'bundled_with',
  PACE_ADJUSTS = 'pace_adjusts',
}

export const UPSELL_BFS_PATHS: ReadonlyArray<ReadonlyArray<string>> = Object.freeze([
  Object.freeze(['Guest_Family', 'Room_Fireplace', 'Upsell_WineTasting']),
  Object.freeze(['Guest_Romantic', 'Room_Suite', 'Upsell_CouplesMassage']),
  Object.freeze(['Guest_B2B', 'Booking_Buyout', 'Upsell_EventPackage']),
  Object.freeze(['Guest_Leisure', 'Room_Standard', 'Upsell_DayUse', 'Upsell_PoolAccess']),
  Object.freeze(['Guest_Any', 'Room_Any', 'Upsell_LateCheckout']),
]);

export interface PricingRecommendation {
  readonly roomTypeId: string;
  readonly suggestedPriceUsd: number;
  readonly minPriceUsd: number;
  readonly maxPriceUsd: number;
  readonly occupancyPercent: number;
  readonly demandFactor: number;
  readonly competitorAvg: number;
  readonly confidence: number;
  readonly reasoning: string;
}

export interface UpsellRecommendation {
  readonly path: ReadonlyArray<string>;
  readonly product: string;
  readonly confidence: number;
  readonly matchType: 'exact' | 'wildcard';
  readonly steps: number;
}

export class UpsellPathRecommender {
  recommend(persona: string, now: number = Date.now()): UpsellRecommendation[] {
    const results: UpsellRecommendation[] = [];
    const seen = new Set<string>();

    for (const path of UPSELL_BFS_PATHS) {
      const matchType = path[0] === `Guest_${persona}` ? 'exact' as const
        : path[0] === 'Guest_Any' ? 'wildcard' as const
        : null;
      if (!matchType) continue;

      const product = [...path].reverse().find(s => s.startsWith('Upsell_'));
      if (!product) continue;

      const key = `${path.join('→')}|${matchType}`;
      if (seen.has(key)) continue;
      seen.add(key);

      results.push(Object.freeze({
        path,
        product,
        confidence: matchType === 'exact' ? 0.9 : 0.5,
        matchType,
        steps: path.length - 1,
      }));
    }

    results.sort((a, b) => b.confidence - a.confidence || a.steps - b.steps);
    return results;
  }
}

export class RevenueGraphService {
  private readonly pricingRules = new Map<string, {
    readonly basePrice: number;
    readonly seasonMultiplier: number;
    readonly occupancyMultiplier: number;
    readonly competitorMultiplier: number;
  }>();

  addPricingRule(roomTypeId: string, basePrice: number): void {
    this.pricingRules.set(roomTypeId, Object.freeze({
      basePrice,
      seasonMultiplier: 1.0,
      occupancyMultiplier: 1.0,
      competitorMultiplier: 1.0,
    }));
  }

  calculatePrice(
    roomTypeId: string,
    occupancyPercent: number,
    seasonDemand: number,
    competitorAvgPrice: number | null,
  ): PricingRecommendation | null {
    const rule = this.pricingRules.get(roomTypeId);
    if (!rule) return null;

    const occupancyFactor = occupancyPercent > 0.80 ? 1.15 : occupancyPercent > 0.60 ? 1.0 : 0.90;
    const seasonFactor = seasonDemand > 0.8 ? 1.20 : seasonDemand > 0.5 ? 1.05 : 0.95;
    const competitorFactor = competitorAvgPrice && competitorAvgPrice > 0
      ? Math.min(Math.max(competitorAvgPrice / rule.basePrice, 0.85), 1.20)
      : 1.0;

    const suggested = rule.basePrice * occupancyFactor * seasonFactor * competitorFactor;
    const minPrice = suggested * 0.85;
    const maxPrice = suggested * 1.15;
    const confidence = 0.7 + (occupancyPercent * 0.2) + (seasonDemand * 0.1);

    return Object.freeze({
      roomTypeId,
      suggestedPriceUsd: Math.round(suggested * 100) / 100,
      minPriceUsd: Math.round(minPrice * 100) / 100,
      maxPriceUsd: Math.round(maxPrice * 100) / 100,
      occupancyPercent: Math.round(occupancyPercent * 100) / 100,
      demandFactor: Math.round(seasonDemand * 100) / 100,
      competitorAvg: competitorAvgPrice ?? 0,
      confidence: Math.min(confidence, 0.99),
      reasoning: `base=${rule.basePrice} × occ=${occupancyFactor.toFixed(2)} × season=${seasonFactor.toFixed(2)} × comp=${competitorFactor.toFixed(2)}`,
    });
  }
}
