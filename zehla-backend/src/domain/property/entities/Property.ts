import { Result } from '../../shared/Result'
import { DomainEvent } from '../../shared/DomainEvent'
import { PropertyStatus, Plan, Feature, SubscriptionStatus, CadasturStatus, canTransitionPropertyStatus } from '../enums'
import { Address } from '../value-objects/Address'
import { ContactInfo } from '../value-objects/ContactInfo'
import { FeatureSet } from '../value-objects/FeatureSet'
import { TrialPeriod } from '../value-objects/TrialPeriod'
import { Subscription } from '../value-objects/Subscription'
import { RegistrationNumber } from '../value-objects/RegistrationNumber'
import { VoiceTokenBudget } from '../value-objects/VoiceTokenBudget'
import { OperationalWindow } from '../value-objects/OperationalWindow'
import { CadasturInfo } from '../value-objects/CadasturInfo'
import { UTMTracking } from '../value-objects/UTMTracking'
import { PropertyConfiguration } from '../value-objects/PropertyConfiguration'
import { PixKey, PixKeyType } from '../../financeiro/value-objects/PixKey'
import {
  PropertyCreatedEvent,
  PropertyActivatedEvent,
  PropertySuspendedEvent,
  PropertyReactivatedEvent,
  PropertyChurnedEvent,
  PropertyPlanChangedEvent,
  TrialStartedEvent,
  TrialExpiringEvent,
  TrialExpiredEvent,
  VoiceTokensExhaustedEvent,
  PropertyConfigurationUpdatedEvent,
} from '../events'

export interface PropertyData {
  id: string
  name: string
  slug: string
  description?: string
  address: Address
  contactInfo: ContactInfo
  pixKey?: PixKey
  status: PropertyStatus
  plan: Plan
  trialPeriod?: TrialPeriod
  subscription?: Subscription
  registrationNumber: RegistrationNumber
  voiceBudget: VoiceTokenBudget
  configuration: PropertyConfiguration
  cadastur?: CadasturInfo
  utmTracking: UTMTracking
  fnrhEnabled: boolean
  fnrhManagerCpf?: string
  capacity: number
  isCanary: boolean
  refSource?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePropertyProps {
  id: string
  name: string
  slug: string
  description?: string
  address: Address
  contactInfo: ContactInfo
  capacity: number
  registrationNumber: RegistrationNumber
  isCanary?: boolean
  refSource?: string
  utmTracking?: UTMTracking
  pixKey?: PixKey
}

export interface UpdateConfigProps {
  address?: Address
  contactInfo?: ContactInfo
  configuration?: {
    operationalWindow?: OperationalWindow
    currencyCode?: string
    locale?: string
    timezone?: string
    whatsappChannelType?: string
  }
  pixKey?: PixKey
}

const CPF_REGEX = /^\d{11}$/

export class Property {
  private _events: DomainEvent[] = []

  private constructor(private data: PropertyData) {}

  static restore(data: PropertyData): Property {
    return new Property({ ...data })
  }

  static create(props: CreatePropertyProps): Result<Property, string> {
    if (!props.id) return Result.fail('Property ID is required')
    if (!props.name || props.name.trim().length === 0) return Result.fail('Property name is required')
    if (!props.slug || props.slug.trim().length === 0) return Result.fail('Property slug is required')
    if (props.capacity <= 0) return Result.fail('Capacity must be greater than zero')

    const configResult = PropertyConfiguration.create()
    if (configResult.isFail) return Result.fail(configResult.error)

    const utm = props.utmTracking ?? UTMTracking.create({}).value

    const property = new Property({
      id: props.id,
      name: props.name.trim(),
      slug: props.slug.trim().toLowerCase(),
      description: props.description,
      address: props.address,
      contactInfo: props.contactInfo,
      pixKey: props.pixKey,
      status: PropertyStatus.PENDING_SETUP,
      plan: Plan.LITE,
      registrationNumber: props.registrationNumber,
      voiceBudget: VoiceTokenBudget.create(100000).value,
      configuration: configResult.value,
      utmTracking: utm,
      fnrhEnabled: false,
      capacity: props.capacity,
      isCanary: props.isCanary ?? false,
      refSource: props.refSource,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    property._events.push({
      aggregateId: props.id,
      eventName: 'PropertyCreated',
      occurredAt: new Date(),
      payload: {
        name: property.data.name,
        slug: property.data.slug,
        registrationNumber: property.data.registrationNumber.value,
        plan: property.data.plan,
        uf: property.data.registrationNumber.getUf(),
      },
    } as PropertyCreatedEvent)

    return Result.ok(property)
  }

  get id(): string { return this.data.id }
  get name(): string { return this.data.name }
  get slug(): string { return this.data.slug }
  get description(): string | undefined { return this.data.description }
  get address(): Address { return this.data.address }
  get contactInfo(): ContactInfo { return this.data.contactInfo }
  get pixKey(): PixKey | undefined { return this.data.pixKey }
  get status(): PropertyStatus { return this.data.status }
  get plan(): Plan { return this.data.plan }
  get trialPeriod(): TrialPeriod | undefined { return this.data.trialPeriod }
  get subscription(): Subscription | undefined { return this.data.subscription }
  get registrationNumber(): RegistrationNumber { return this.data.registrationNumber }
  get voiceBudget(): VoiceTokenBudget { return this.data.voiceBudget }
  get configuration(): PropertyConfiguration { return this.data.configuration }
  get cadastur(): CadasturInfo | undefined { return this.data.cadastur }
  get utmTracking(): UTMTracking { return this.data.utmTracking }
  get fnrhEnabled(): boolean { return this.data.fnrhEnabled }
  get fnrhManagerCpf(): string | undefined { return this.data.fnrhManagerCpf }
  get capacity(): number { return this.data.capacity }
  get isCanary(): boolean { return this.data.isCanary }
  get refSource(): string | undefined { return this.data.refSource }
  get createdAt(): Date { return this.data.createdAt }
  get updatedAt(): Date { return this.data.updatedAt }
  get events(): DomainEvent[] { return [...this._events] }

  hasFeature(feature: Feature): boolean {
    return FeatureSet.fromPlan(this.data.plan).hasFeature(feature)
  }

  isTrial(): boolean {
    return this.data.trialPeriod !== undefined && this.data.trialPeriod.isActive()
  }

  isOperational(): boolean {
    if (this.data.status === PropertyStatus.ACTIVE) return true
    if (this.data.status === PropertyStatus.PENDING_SETUP) return false
    if (this.data.status === PropertyStatus.TRIAL_EXPIRED) return false
    if (this.data.status === PropertyStatus.CHURNED) return false
    if (this.data.status === PropertyStatus.SUSPENDED) return false
    return this.isTrial()
  }

  canUsePaidFeatures(): boolean {
    return this.data.status !== PropertyStatus.TRIAL_EXPIRED &&
      this.data.status !== PropertyStatus.CHURNED
  }

  activate(): Result<void, string> {
    if (this.data.status === PropertyStatus.ACTIVE) {
      return Result.fail('Property já está ativa')
    }
    if (this.data.status === PropertyStatus.CHURNED) {
      return Result.fail('Property cancelada não pode ser ativada')
    }
    if (this.data.status === PropertyStatus.SUSPENDED) {
      return Result.fail('Property suspensa deve usar reativação')
    }
    if (this.data.status !== PropertyStatus.PENDING_SETUP) {
      return Result.fail('Property não pode ser ativada do estado atual')
    }

    const previousStatus = this.data.status
    this.data.status = PropertyStatus.ACTIVE
    this.data.updatedAt = new Date()

    if (!this.data.trialPeriod) {
      const trialResult = TrialPeriod.create(new Date(), 7)
      if (trialResult.isFail) return Result.fail(trialResult.error)
      this.data.trialPeriod = trialResult.value

      this._events.push({
        aggregateId: this.data.id,
        eventName: 'TrialStarted',
        occurredAt: new Date(),
        payload: {
          trialEndDate: trialResult.value.endDate,
          durationDays: 7,
        },
      } as TrialStartedEvent)
    }

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PropertyActivated',
      occurredAt: new Date(),
      payload: {
        previousStatus,
        newStatus: PropertyStatus.ACTIVE,
        activationType: 'TRIAL_START',
      },
    } as PropertyActivatedEvent)

    return Result.ok(undefined)
  }

  suspend(reason: string): Result<void, string> {
    if (!canTransitionPropertyStatus(this.data.status, PropertyStatus.SUSPENDED)) {
      return Result.fail(`Cannot suspend property from status ${this.data.status}`)
    }
    if (!reason || reason.trim().length === 0) {
      return Result.fail('Suspend reason is required')
    }

    this.data.status = PropertyStatus.SUSPENDED
    this.data.updatedAt = new Date()

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PropertySuspended',
      occurredAt: new Date(),
      payload: { reason: reason.trim() },
    } as PropertySuspendedEvent)

    return Result.ok(undefined)
  }

  reactivate(): Result<void, string> {
    if (this.data.status !== PropertyStatus.SUSPENDED) {
      return Result.fail('Property não está suspensa')
    }

    this.data.status = PropertyStatus.ACTIVE
    this.data.updatedAt = new Date()

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PropertyReactivated',
      occurredAt: new Date(),
      payload: {},
    } as PropertyReactivatedEvent)

    return Result.ok(undefined)
  }

  churn(): Result<void, string> {
    if (!canTransitionPropertyStatus(this.data.status, PropertyStatus.CHURNED)) {
      return Result.fail(`Cannot churn property from status ${this.data.status}`)
    }

    const previousPlan = this.data.plan
    this.data.status = PropertyStatus.CHURNED
    this.data.updatedAt = new Date()

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PropertyChurned',
      occurredAt: new Date(),
      payload: { previousPlan, reason: 'Cancelamento definitivo' },
    } as PropertyChurnedEvent)

    return Result.ok(undefined)
  }

  changePlan(newPlan: Plan, subscription: Subscription): Result<void, string> {
    if (this.data.status === PropertyStatus.CHURNED) {
      return Result.fail('Property cancelada não pode mudar de plano')
    }

    const previousPlan = this.data.plan
    this.data.plan = newPlan
    this.data.subscription = subscription
    this.data.updatedAt = new Date()

    if (this.data.status === PropertyStatus.TRIAL_EXPIRED) {
      this.data.status = PropertyStatus.ACTIVE
      this._events.push({
        aggregateId: this.data.id,
        eventName: 'PropertyActivated',
        occurredAt: new Date(),
        payload: {
          previousStatus: PropertyStatus.TRIAL_EXPIRED,
          newStatus: PropertyStatus.ACTIVE,
          activationType: 'NEW_SUBSCRIPTION',
        },
      } as PropertyActivatedEvent)
    }

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PropertyPlanChanged',
      occurredAt: new Date(),
      payload: { previousPlan, newPlan },
    } as PropertyPlanChangedEvent)

    return Result.ok(undefined)
  }

  checkTrial(): Result<void, string> {
    if (!this.data.trialPeriod || this.data.status === PropertyStatus.TRIAL_EXPIRED) {
      return Result.ok(undefined)
    }
    if (this.data.status !== PropertyStatus.ACTIVE) {
      return Result.ok(undefined)
    }

    if (this.data.trialPeriod.shouldNotifyDay6()) {
      this.data.trialPeriod = this.data.trialPeriod.markNotificationSent()
      this.data.updatedAt = new Date()

      this._events.push({
        aggregateId: this.data.id,
        eventName: 'TrialExpiring',
        occurredAt: new Date(),
        payload: {
          daysRemaining: this.data.trialPeriod.daysRemaining(),
          trialEndDate: this.data.trialPeriod.endDate,
        },
      } as TrialExpiringEvent)
    }

    if (this.data.trialPeriod.isExpired()) {
      this.data.trialPeriod = this.data.trialPeriod.expire()
      this.data.status = PropertyStatus.TRIAL_EXPIRED
      this.data.updatedAt = new Date()

      this._events.push({
        aggregateId: this.data.id,
        eventName: 'TrialExpired',
        occurredAt: new Date(),
        payload: {
          trialEndDate: this.data.trialPeriod.endDate,
        },
      } as TrialExpiredEvent)
    }

    return Result.ok(undefined)
  }

  consumeVoiceTokens(count: number): Result<void, string> {
    if (this.data.status === PropertyStatus.CHURNED || this.data.status === PropertyStatus.TRIAL_EXPIRED) {
      return Result.fail('Property cancelada não pode consumir tokens')
    }

    const wasExhausted = this.data.voiceBudget.isExhausted()
    const budgetResult = this.data.voiceBudget.consume(count)
    if (budgetResult.isFail) {
      if (!wasExhausted) {
        this._events.push({
          aggregateId: this.data.id,
          eventName: 'VoiceTokensExhausted',
          occurredAt: new Date(),
          payload: {
            used: this.data.voiceBudget.used,
            limit: this.data.voiceBudget.limit,
          },
        } as VoiceTokensExhaustedEvent)
      }
      return Result.fail(budgetResult.error)
    }

    this.data.voiceBudget = budgetResult.value
    this.data.updatedAt = new Date()

    return Result.ok(undefined)
  }

  updateCadastur(info: CadasturInfo): void {
    this.data.cadastur = info
    this.data.updatedAt = new Date()
  }

  enableFnrh(managerCpf: string): Result<void, string> {
    if (!CPF_REGEX.test(managerCpf)) {
      return Result.fail('Invalid CPF format for FNRH manager')
    }
    this.data.fnrhEnabled = true
    this.data.fnrhManagerCpf = managerCpf
    this.data.updatedAt = new Date()
    return Result.ok(undefined)
  }

  disableFnrh(): void {
    this.data.fnrhEnabled = false
    this.data.fnrhManagerCpf = undefined
    this.data.updatedAt = new Date()
  }

  updateConfiguration(props: UpdateConfigProps): Result<void, string> {
    if (this.data.status === PropertyStatus.CHURNED) {
      return Result.fail('Property cancelada não pode ser atualizada')
    }

    const changedFields: string[] = []

    if (props.address) {
      this.data.address = props.address
      changedFields.push('address')
    }
    if (props.contactInfo) {
      this.data.contactInfo = props.contactInfo
      changedFields.push('contactInfo')
    }
    if (props.pixKey) {
      this.data.pixKey = props.pixKey
      changedFields.push('pixKey')
    }
    if (props.configuration) {
      const configResult = this.data.configuration.update(props.configuration as any)
      if (configResult.isFail) return Result.fail(configResult.error)
      this.data.configuration = configResult.value
      changedFields.push('configuration')
    }

    if (changedFields.length > 0) {
      this.data.updatedAt = new Date()
      this._events.push({
        aggregateId: this.data.id,
        eventName: 'PropertyConfigurationUpdated',
        occurredAt: new Date(),
        payload: { changedFields },
      } as PropertyConfigurationUpdatedEvent)
    }

    return Result.ok(undefined)
  }

  updateCapacity(newCapacity: number): Result<void, string> {
    if (newCapacity <= 0) {
      return Result.fail('Capacity must be greater than zero')
    }
    this.data.capacity = newCapacity
    this.data.updatedAt = new Date()
    return Result.ok(undefined)
  }

  clearEvents(): void {
    this._events = []
  }
}
