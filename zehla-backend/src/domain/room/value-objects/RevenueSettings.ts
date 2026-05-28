import { Result } from '../../shared/Result'
import { MonetaryValue } from './MonetaryValue'

export interface LeadTimeDiscount {
  daysBefore: number
  discount: number
}

export interface OccupancyThreshold {
  minOccupancy: number
  multiplier: number
}

export interface RevenueSettingsProps {
  dynamicPricingEnabled: boolean
  minPrice: number | null
  maxPrice: number | null
  weekendMultiplier: number
  seasonalMultiplier: number
  leadTimeDiscounts: LeadTimeDiscount[]
  occupancyThresholds: OccupancyThreshold[]
}

const FRIDAY = 5
const SATURDAY = 6

export class RevenueSettings {
  private constructor(private readonly props: RevenueSettingsProps) {
    Object.freeze(this)
  }

  static create(props: Partial<RevenueSettingsProps>): Result<RevenueSettings, string> {
    const weekendMultiplier = props.weekendMultiplier ?? 1.10
    const seasonalMultiplier = props.seasonalMultiplier ?? 1.20

    if (weekendMultiplier < 1.0) {
      return Result.fail('Multiplicador de fim de semana não pode ser menor que 1.0')
    }
    if (seasonalMultiplier < 1.0) {
      return Result.fail('Multiplicador de temporada não pode ser menor que 1.0')
    }
    if (props.minPrice !== null && props.minPrice !== undefined && props.minPrice < 0) {
      return Result.fail('Preço mínimo não pode ser negativo')
    }
    if (props.maxPrice !== null && props.maxPrice !== undefined && props.maxPrice < 0) {
      return Result.fail('Preço máximo não pode ser negativo')
    }
    if (
      props.minPrice !== null && props.minPrice !== undefined &&
      props.maxPrice !== null && props.maxPrice !== undefined &&
      props.minPrice > props.maxPrice
    ) {
      return Result.fail('Preço mínimo não pode ser maior que o preço máximo')
    }

    const leadTimeDiscounts = (props.leadTimeDiscounts ?? [])
      .map((d) => ({ daysBefore: d.daysBefore, discount: Math.min(d.discount, 1.0) }))
      .sort((a, b) => b.daysBefore - a.daysBefore)

    for (const d of leadTimeDiscounts) {
      if (d.daysBefore < 1) return Result.fail('daysBefore deve ser >= 1')
      if (d.discount < 0) return Result.fail('desconto não pode ser negativo')
    }

    const occupancyThresholds = (props.occupancyThresholds ?? [])
      .map((t) => ({ minOccupancy: t.minOccupancy, multiplier: t.multiplier }))
      .sort((a, b) => b.minOccupancy - a.minOccupancy)

    for (const t of occupancyThresholds) {
      if (t.minOccupancy < 0 || t.minOccupancy > 1) {
        return Result.fail('minOccupancy deve estar entre 0 e 1')
      }
      if (t.multiplier < 0) return Result.fail('multiplier não pode ser negativo')
    }

    return Result.ok(new RevenueSettings({
      dynamicPricingEnabled: props.dynamicPricingEnabled ?? false,
      minPrice: props.minPrice ?? null,
      maxPrice: props.maxPrice ?? null,
      weekendMultiplier,
      seasonalMultiplier,
      leadTimeDiscounts,
      occupancyThresholds,
    }))
  }

  static default(): RevenueSettings {
    return new RevenueSettings({
      dynamicPricingEnabled: false,
      minPrice: null,
      maxPrice: null,
      weekendMultiplier: 1.10,
      seasonalMultiplier: 1.20,
      leadTimeDiscounts: [],
      occupancyThresholds: [],
    })
  }

  get dynamicPricingEnabled(): boolean { return this.props.dynamicPricingEnabled }
  get minPrice(): number | null { return this.props.minPrice }
  get maxPrice(): number | null { return this.props.maxPrice }
  get weekendMultiplier(): number { return this.props.weekendMultiplier }
  get seasonalMultiplier(): number { return this.props.seasonalMultiplier }
  get leadTimeDiscounts(): LeadTimeDiscount[] { return [...this.props.leadTimeDiscounts] }
  get occupancyThresholds(): OccupancyThreshold[] { return [...this.props.occupancyThresholds] }

  isWeekend(date: Date): boolean {
    const day = date.getUTCDay()
    return day === FRIDAY || day === SATURDAY
  }

  getWeekendMultiplier(date: Date): number {
    return this.isWeekend(date) ? this.props.weekendMultiplier : 1.0
  }

  getLeadTimeDiscount(checkInDate: Date, currentDate: Date): number {
    if (!this.props.dynamicPricingEnabled || this.props.leadTimeDiscounts.length === 0) return 0

    const daysUntilCheckIn = Math.ceil(
      (Date.UTC(checkInDate.getUTCFullYear(), checkInDate.getUTCMonth(), checkInDate.getUTCDate()) -
        Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate())) /
        (1000 * 60 * 60 * 24)
    )

    if (daysUntilCheckIn <= 0) return 0

    for (const tier of this.props.leadTimeDiscounts) {
      if (daysUntilCheckIn >= tier.daysBefore) {
        return tier.discount
      }
    }

    return 0
  }

  getOccupancyMultiplier(occupancyRate: number): number {
    if (!this.props.dynamicPricingEnabled || this.props.occupancyThresholds.length === 0) return 1.0

    for (const tier of this.props.occupancyThresholds) {
      if (occupancyRate >= tier.minOccupancy) {
        return tier.multiplier
      }
    }

    return 1.0
  }

  applyPriceClamp(price: MonetaryValue): Result<MonetaryValue, string> {
    if (this.props.minPrice !== null && price.amount < this.props.minPrice) {
      return MonetaryValue.create(this.props.minPrice)
    }
    if (this.props.maxPrice !== null && price.amount > this.props.maxPrice) {
      return MonetaryValue.create(this.props.maxPrice)
    }
    return Result.ok(price)
  }

  toJSON() {
    return { ...this.props }
  }
}
