import type { ProviderCapabilityProfile } from '../models/ProviderCapabilityProfile';

export interface IBucketRequirement {
  readonly minTier: 1 | 2 | 3;
  readonly maxSlaMs: number;
  readonly requiredCapabilities: string[];
}

export class ParetoMultiObjectiveSelector {
  private static readonly BUCKET_REQUIREMENTS: Record<string, IBucketRequirement> = {
    '00': { minTier: 1, maxSlaMs: 500, requiredCapabilities: ['conversation'] }, // faq_hours_operating
    '01': { minTier: 1, maxSlaMs: 500, requiredCapabilities: ['conversation'] }, // faq_location_access
    '02': { minTier: 1, maxSlaMs: 500, requiredCapabilities: ['conversation'] }, // faq_amenities_services
    '03': { minTier: 1, maxSlaMs: 500, requiredCapabilities: ['conversation'] }, // faq_policies_rules
    '04': { minTier: 1, maxSlaMs: 800, requiredCapabilities: ['conversation'] }, // faq_general_misc
    '05': { minTier: 2, maxSlaMs: 1500, requiredCapabilities: ['reasoning', 'conversation'] }, // pricing_simple_query
    '06': { minTier: 2, maxSlaMs: 2000, requiredCapabilities: ['reasoning', 'conversation'] }, // pricing_comparison
    '07': { minTier: 2, maxSlaMs: 2000, requiredCapabilities: ['reasoning', 'creative'] }, // pricing_seasonal_promo
    '08': { minTier: 3, maxSlaMs: 3000, requiredCapabilities: ['reasoning', 'conversation'] }, // pricing_negotiation
    '09': { minTier: 2, maxSlaMs: 2000, requiredCapabilities: ['json'] }, // booking_new_request
    '10': { minTier: 2, maxSlaMs: 2000, requiredCapabilities: ['json'] }, // booking_modification
    '11': { minTier: 2, maxSlaMs: 1500, requiredCapabilities: ['json'] }, // booking_cancellation
    '12': { minTier: 1, maxSlaMs: 500, requiredCapabilities: ['conversation'] }, // booking_checkin_confirm
    '13': { minTier: 3, maxSlaMs: 3000, requiredCapabilities: ['safety'] }, // complaint_cleanliness
    '14': { minTier: 3, maxSlaMs: 3000, requiredCapabilities: ['safety'] }, // complaint_noise
    '15': { minTier: 3, maxSlaMs: 3000, requiredCapabilities: ['safety'] }, // complaint_service_staff
    '16': { minTier: 3, maxSlaMs: 3000, requiredCapabilities: ['safety'] }, // complaint_maintenance
    '17': { minTier: 3, maxSlaMs: 3000, requiredCapabilities: ['safety'] }, // complaint_food_beverage
    '18': { minTier: 3, maxSlaMs: 5000, requiredCapabilities: ['reasoning', 'safety'] }, // complaint_billing_charge
    '19': { minTier: 3, maxSlaMs: 5000, requiredCapabilities: ['reasoning', 'safety'] }, // sentiment_negative_deep
    '20': { minTier: 3, maxSlaMs: 5000, requiredCapabilities: ['reasoning'] }, // semantic_comparison
    '21': { minTier: 2, maxSlaMs: 3000, requiredCapabilities: ['conversation'] }, // semantic_recommendation
    '22': { minTier: 2, maxSlaMs: 8000, requiredCapabilities: ['creative'] }, // content_social_media
    '23': { minTier: 2, maxSlaMs: 8000, requiredCapabilities: ['creative'] }, // content_email_marketing
    '24': { minTier: 2, maxSlaMs: 8000, requiredCapabilities: ['creative'] }, // content_listing_desc
    '25': { minTier: 3, maxSlaMs: 5000, requiredCapabilities: ['creative', 'safety'] }, // review_google_trustpilot
    '26': { minTier: 3, maxSlaMs: 5000, requiredCapabilities: ['creative', 'safety'] }, // review_booking_tripadvisor
    '27': { minTier: 2, maxSlaMs: 2000, requiredCapabilities: ['multilingual'] }, // multilingual_english
    '28': { minTier: 2, maxSlaMs: 2000, requiredCapabilities: ['multilingual'] }, // multilingual_spanish
    '29': { minTier: 2, maxSlaMs: 2000, requiredCapabilities: ['multilingual'] }, // multilingual_other
    '30': { minTier: 1, maxSlaMs: 200, requiredCapabilities: ['safety'] }, // emergency_medical
    '31': { minTier: 1, maxSlaMs: 200, requiredCapabilities: ['safety'] } // emergency_safety
  };

  selectEligibleProviders(
    bucketId: string,
    allProviders: ProviderCapabilityProfile[],
    maxAllowedTier: 1 | 2 | 3 = 3,
  ): ProviderCapabilityProfile[] {
    const requirement = ParetoMultiObjectiveSelector.BUCKET_REQUIREMENTS[bucketId] || {
      minTier: 1,
      maxSlaMs: 5000,
      requiredCapabilities: [],
    };

    // Filter candidate list
    let eligible = allProviders.filter((p) => {
      // 1. Tier restriction (must be >= minTier required by bucket, and <= maxAllowedTier imposed by BudgetGuard)
      if (p.tier < requirement.minTier) return false;
      if (p.tier > maxAllowedTier) return false;

      // 2. SLA constraint (must be within acceptable latency bounds)
      if (p.slaLatencyMs > requirement.maxSlaMs) return false;

      // 3. Capabilities verification (all required capabilities must be >= 0.5)
      for (const capName of requirement.requiredCapabilities) {
        const val = (p.capabilities as any)[capName];
        if (typeof val === 'number' && val < 0.5) {
          return false;
        }
      }

      return true;
    });

    // Fallback: If no provider satisfies the strict criteria (e.g. due to budget restriction downgrades or tight SLAs),
    // relax SLA and capability checks, but strictly respect budget-imposed maxAllowedTier and minimum capability (conversation >= 0.5)
    if (eligible.length === 0) {
      eligible = allProviders.filter((p) => {
        if (p.tier > maxAllowedTier) return false;
        return p.capabilities.conversation >= 0.5;
      });
    }

    return eligible;
  }
}
