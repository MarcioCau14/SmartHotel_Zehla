import { Result } from '../../../shared/Result'
import type { PaymentSplitConfig } from '../../../domain/finance/ports/IFinancialGatewayPort'

export interface SubscriptionPricing {
  readonly planName: string
  readonly monthlyPriceBrl: number
  readonly annualPriceBrl: number
  readonly trialDays: number
  readonly stripePriceId: string
}

export const SUBSCRIPTION_PRICES: ReadonlyArray<SubscriptionPricing> = Object.freeze([
  { planName: 'LITE', monthlyPriceBrl: 197, annualPriceBrl: 1970, trialDays: 14, stripePriceId: '' },
  { planName: 'PRO', monthlyPriceBrl: 397, annualPriceBrl: 3970, trialDays: 14, stripePriceId: '' },
  { planName: 'MAX', monthlyPriceBrl: 697, annualPriceBrl: 6970, trialDays: 14, stripePriceId: '' },
])

export const PRICING_VALUES: ReadonlyArray<{ nome: string; pix: number; cartao: number }> = Object.freeze([
  { nome: 'LITE', pix: 197, cartao: 247 },
  { nome: 'PRO', pix: 397, cartao: 447 },
  { nome: 'MAX', pix: 697, cartao: 797 },
])

export class PlanPricingService {
  static precoPorPlano(plano: string): { mensal: number; anual: number } | undefined {
    const found = SUBSCRIPTION_PRICES.find((p) => p.planName === plano)
    if (!found) return undefined
    return { mensal: found.monthlyPriceBrl, anual: found.annualPriceBrl }
  }

  static valorPix(plano: string): number | undefined {
    return PRICING_VALUES.find((p) => p.nome === plano)?.pix
  }

  static valorCartao(plano: string): number | undefined {
    return PRICING_VALUES.find((p) => p.nome === plano)?.cartao
  }

  static calcularSplit(grossAmount: number, planName: string): { zehla: number; pousada: number } {
    const percentage = planName === 'MAX' ? 0.20 : planName === 'PRO' ? 0.15 : planName === 'LITE' ? 0.10 : 0.05
    const zehla = Math.round(grossAmount * percentage * 100) / 100
    const pousada = Math.round((grossAmount - zehla) * 100) / 100
    return { zehla, pousada }
  }
}
