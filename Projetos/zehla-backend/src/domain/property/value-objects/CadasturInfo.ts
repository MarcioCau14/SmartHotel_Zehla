import { Result } from '../../shared/Result'
import { CadasturStatus } from '../enums'

export interface CadasturInfoProps {
  number: string
  status: CadasturStatus
  expiryDate: Date
}

export class CadasturInfo {
  private constructor(private readonly props: CadasturInfoProps) {
    Object.freeze(this)
  }

  static create(props: CadasturInfoProps): Result<CadasturInfo, string> {
    if (!props.number || props.number.trim().length === 0) {
      return Result.fail('Cadastur number is required')
    }
    if (!props.expiryDate || props.expiryDate <= new Date()) {
      return Result.fail('Expiry date must be in the future')
    }

    return Result.ok(new CadasturInfo({
      number: props.number.trim(),
      status: props.status,
      expiryDate: props.expiryDate,
    }))
  }

  static restore(props: CadasturInfoProps): CadasturInfo {
    return new CadasturInfo({ ...props })
  }

  get number(): string { return this.props.number }
  get status(): CadasturStatus { return this.props.status }
  get expiryDate(): Date { return new Date(this.props.expiryDate) }

  isValid(): boolean {
    return this.props.status === CadasturStatus.VALID
  }

  isExpiringSoon(days: number = 30): boolean {
    if (this.props.status === CadasturStatus.EXPIRED) return false
    const diff = this.props.expiryDate.getTime() - Date.now()
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return diffDays <= days
  }

  needsRenewal(): boolean {
    return this.props.status === CadasturStatus.EXPIRED ||
      this.props.status === CadasturStatus.EXPIRING
  }

  checkExpiry(referenceDate?: Date): CadasturInfo {
    const ref = referenceDate ?? new Date()
    const diff = this.props.expiryDate.getTime() - ref.getTime()
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))

    let newStatus = this.props.status
    if (diffDays < 0) {
      newStatus = CadasturStatus.EXPIRED
    } else if (diffDays <= 30) {
      newStatus = CadasturStatus.EXPIRING
    }

    return new CadasturInfo({
      ...this.props,
      status: newStatus,
    })
  }

  equals(other: CadasturInfo): boolean {
    return this.props.number === other.props.number &&
      this.props.status === other.props.status &&
      this.props.expiryDate.getTime() === other.props.expiryDate.getTime()
  }
}
