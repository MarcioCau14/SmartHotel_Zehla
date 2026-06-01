import { Result } from '../../shared/Result'
import { UF_LIST } from '../enums'

export interface AddressProps {
  street: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
}

const CEP_REGEX = /^\d{5}-\d{3}$/

export class Address {
  private constructor(public readonly props: AddressProps) {
    Object.freeze(this)
  }

  static create(props: AddressProps): Result<Address, string> {
    if (!props.street || props.street.trim().length === 0) {
      return Result.fail('Street is required')
    }
    if (!props.city || props.city.trim().length === 0) {
      return Result.fail('City is required')
    }
    if (!props.state || !UF_LIST.includes(props.state.toUpperCase())) {
      return Result.fail('State must be a valid Brazilian UF')
    }
    if (!props.zipCode || !CEP_REGEX.test(props.zipCode)) {
      return Result.fail('CEP must be in the format NNNNN-NNN')
    }

    return Result.ok(new Address({
      street: props.street.trim(),
      city: props.city.trim(),
      state: props.state.toUpperCase(),
      zipCode: props.zipCode,
      latitude: props.latitude,
      longitude: props.longitude,
    }))
  }

  static restore(props: AddressProps): Address {
    return new Address({ ...props })
  }

  get street(): string { return this.props.street }
  get city(): string { return this.props.city }
  get state(): string { return this.props.state }
  get zipCode(): string { return this.props.zipCode }
  get latitude(): number | undefined { return this.props.latitude }
  get longitude(): number | undefined { return this.props.longitude }

  fullAddress(): string {
    return `${this.props.street}, ${this.props.city} - ${this.props.state}`
  }

  equals(other: Address): boolean {
    return this.props.street === other.props.street &&
      this.props.city === other.props.city &&
      this.props.state === other.props.state &&
      this.props.zipCode === other.props.zipCode
  }
}
