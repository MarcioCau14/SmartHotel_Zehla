import { Result } from '../../shared/Result'
import { RoomType } from '../enums'
import { MonetaryValue } from '../value-objects/MonetaryValue'
import { RoomDateRange } from '../value-objects/RoomDateRange'

export interface PricingRuleData {
  id: string
  name: string
  description?: string
  roomType: RoomType | null
  dateRange: RoomDateRange
  multiplier: number
  fixedAmount: MonetaryValue | null
  isActive: boolean
  overridePriority: number
  propertyId: string
  createdAt: Date
}

const MIN_MULTIPLIER = 0.5

export class PricingRule {
  private constructor(private data: PricingRuleData) {}

  static create(props: {
    id: string
    name: string
    description?: string
    roomType?: RoomType
    dateRange: RoomDateRange
    multiplier?: number
    fixedAmount?: MonetaryValue
    propertyId: string
  }): Result<PricingRule, string> {
    if (!props.id) return Result.fail('ID da regra é obrigatório')
    if (!props.name || props.name.trim().length < 2) {
      return Result.fail('Nome da regra deve ter no mínimo 2 caracteres')
    }
    if (!props.propertyId) return Result.fail('propertyId é obrigatório')

    const multiplier = props.multiplier ?? 1.0

    if (multiplier < MIN_MULTIPLIER) {
      return Result.fail(`Multiplicador não pode ser menor que ${MIN_MULTIPLIER}`)
    }
    if (multiplier > 100) {
      return Result.fail('Multiplicador não pode ser maior que 100')
    }

    if (props.fixedAmount && props.fixedAmount.isZero()) {
      return Result.fail('Valor fixo não pode ser zero')
    }

    if (props.dateRange.nights < 1) {
      return Result.fail('Período da regra deve ter no mínimo 1 noite')
    }

    return Result.ok(
      new PricingRule({
        id: props.id,
        name: props.name.trim(),
        description: props.description,
        roomType: props.roomType ?? null,
        dateRange: props.dateRange,
        multiplier,
        fixedAmount: props.fixedAmount ?? null,
        isActive: true,
        overridePriority: 0,
        propertyId: props.propertyId,
        createdAt: new Date(),
      })
    )
  }

  get id(): string { return this.data.id }
  get name(): string { return this.data.name }
  get description(): string | undefined { return this.data.description }
  get roomType(): RoomType | null { return this.data.roomType }
  get dateRange(): RoomDateRange { return this.data.dateRange }
  get multiplier(): number { return this.data.multiplier }
  get fixedAmount(): MonetaryValue | null { return this.data.fixedAmount }
  get isActive(): boolean { return this.data.isActive }
  get overridePriority(): number { return this.data.overridePriority }
  get propertyId(): string { return this.data.propertyId }
  get createdAt(): Date { return this.data.createdAt }

  applyTo(basePrice: MonetaryValue): Result<MonetaryValue, string> {
    if (!this.data.isActive) {
      return Result.fail(`Regra "${this.data.name}" está inativa`)
    }

    if (this.data.fixedAmount) {
      return Result.ok(this.data.fixedAmount)
    }

    const finalPrice = basePrice.multiply(this.data.multiplier)

    if (finalPrice.amount < basePrice.amount * MIN_MULTIPLIER) {
      return Result.fail(`Preço final não pode ser menor que ${MIN_MULTIPLIER * 100}% do preço base`)
    }

    return Result.ok(finalPrice)
  }

  isActiveOn(date: Date): boolean {
    return this.data.isActive && this.data.dateRange.contains(date)
  }

  conflictsWith(other: PricingRule): boolean {
    if (!this.data.isActive || !other.isActive) return false
    if (this.data.propertyId !== other.propertyId) return false

    const sameType =
      this.data.roomType === null ||
      other.roomType === null ||
      this.data.roomType === other.roomType

    return sameType && this.data.dateRange.overlaps(other.dateRange)
  }

  deactivate(): void {
    this.data.isActive = false
  }

  appliesTo(roomType: RoomType): boolean {
    return this.data.roomType === null || this.data.roomType === roomType
  }

  toJSON() {
    return {
      id: this.data.id,
      name: this.data.name,
      description: this.data.description,
      roomType: this.data.roomType,
      dateRange: this.data.dateRange.toJSON(),
      multiplier: this.data.multiplier,
      fixedAmount: this.data.fixedAmount?.toJSON() ?? null,
      isActive: this.data.isActive,
      overridePriority: this.data.overridePriority,
      propertyId: this.data.propertyId,
      createdAt: this.data.createdAt.toISOString(),
    }
  }
}
