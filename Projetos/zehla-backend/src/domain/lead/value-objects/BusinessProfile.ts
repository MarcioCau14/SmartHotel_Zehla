import { Result } from '../../shared/Result'

export type BusinessCategory = 'pousada' | 'hotel' | 'hostel' | 'outro'
export type OTADependence = 'LOW' | 'MEDIUM' | 'HIGH'

export interface BusinessProfileProps {
  property?: string
  category?: string
  city?: string
  state?: string
  region?: string
  location?: string
  latitude?: number
  longitude?: number
  localPraia?: string
  roomsCount?: number
  instagramFollowers?: number
  googleReviewsCount?: number
  googleRating?: number
  otaDependenceLevel?: string
  otaCommissionLost?: number
  hasWebsite: boolean
}

const VALID_CATEGORIES = ['pousada', 'hotel', 'hostel', 'outro']
const VALID_OTA_LEVELS = ['LOW', 'MEDIUM', 'HIGH']

export class BusinessProfile {
  private constructor(
    public readonly property?: string,
    public readonly category?: string,
    public readonly city?: string,
    public readonly state?: string,
    public readonly region?: string,
    public readonly location?: string,
    public readonly latitude?: number,
    public readonly longitude?: number,
    public readonly localPraia?: string,
    public readonly roomsCount?: number,
    public readonly instagramFollowers?: number,
    public readonly googleReviewsCount?: number,
    public readonly googleRating?: number,
    public readonly otaDependenceLevel?: string,
    public readonly otaCommissionLost?: number,
    public readonly hasWebsite: boolean = false
  ) {
    Object.freeze(this)
  }

  static create(props: BusinessProfileProps): Result<BusinessProfile, string> {
    if (props.roomsCount !== undefined && props.roomsCount < 0) {
      return Result.fail('roomsCount não pode ser negativo')
    }
    if (props.instagramFollowers !== undefined && props.instagramFollowers < 0) {
      return Result.fail('instagramFollowers não pode ser negativo')
    }
    if (props.googleReviewsCount !== undefined && props.googleReviewsCount < 0) {
      return Result.fail('googleReviewsCount não pode ser negativo')
    }
    if (props.googleRating !== undefined && (props.googleRating < 0 || props.googleRating > 5)) {
      return Result.fail('googleRating deve estar entre 0 e 5')
    }
    if (props.otaCommissionLost !== undefined && props.otaCommissionLost < 0) {
      return Result.fail('otaCommissionLost não pode ser negativo')
    }
    if (props.category && !VALID_CATEGORIES.includes(props.category)) {
      return Result.fail(`Categoria inválida: use ${VALID_CATEGORIES.join(', ')}`)
    }
    if (props.otaDependenceLevel && !VALID_OTA_LEVELS.includes(props.otaDependenceLevel)) {
      return Result.fail(`Nível de dependência OTA inválido: use ${VALID_OTA_LEVELS.join(', ')}`)
    }
    return Result.ok(
      new BusinessProfile(
        props.property,
        props.category,
        props.city,
        props.state,
        props.region,
        props.location,
        props.latitude,
        props.longitude,
        props.localPraia,
        props.roomsCount,
        props.instagramFollowers,
        props.googleReviewsCount,
        props.googleRating,
        props.otaDependenceLevel,
        props.otaCommissionLost,
        props.hasWebsite
      )
    )
  }

  toJSON() {
    return {
      property: this.property,
      category: this.category,
      city: this.city,
      state: this.state,
      roomsCount: this.roomsCount,
      hasWebsite: this.hasWebsite,
      region: this.region,
      latitude: this.latitude,
      longitude: this.longitude,
      instagramFollowers: this.instagramFollowers,
      googleReviewsCount: this.googleReviewsCount,
      googleRating: this.googleRating,
      otaDependenceLevel: this.otaDependenceLevel,
      otaCommissionLost: this.otaCommissionLost,
    }
  }
}
