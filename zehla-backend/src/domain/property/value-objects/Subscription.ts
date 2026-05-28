import { Result } from '../../shared/Result'
import { Plan, SubscriptionStatus } from '../enums'

export interface SubscriptionProps {
  plan: Plan
  status: SubscriptionStatus
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  externalSubscriptionId: string
}

export class Subscription {
  private constructor(private readonly props: SubscriptionProps) {
    Object.freeze(this)
  }

  static create(props: SubscriptionProps): Result<Subscription, string> {
    if (!props.externalSubscriptionId || props.externalSubscriptionId.trim().length === 0) {
      return Result.fail('External subscription ID is required')
    }
    if (!props.currentPeriodEnd || props.currentPeriodEnd <= new Date()) {
      return Result.fail('Current period end must be in the future')
    }

    return Result.ok(new Subscription({
      plan: props.plan,
      status: props.status,
      currentPeriodEnd: props.currentPeriodEnd,
      cancelAtPeriodEnd: props.cancelAtPeriodEnd,
      externalSubscriptionId: props.externalSubscriptionId.trim(),
    }))
  }

  static restore(props: SubscriptionProps): Subscription {
    return new Subscription({ ...props })
  }

  get plan(): Plan { return this.props.plan }
  get status(): SubscriptionStatus { return this.props.status }
  get currentPeriodEnd(): Date { return new Date(this.props.currentPeriodEnd) }
  get cancelAtPeriodEnd(): boolean { return this.props.cancelAtPeriodEnd }
  get externalSubscriptionId(): string { return this.props.externalSubscriptionId }

  isActive(): boolean {
    return this.props.status === SubscriptionStatus.ACTIVE ||
      this.props.status === SubscriptionStatus.TRIALING
  }

  isPastDue(): boolean {
    return this.props.status === SubscriptionStatus.PAST_DUE
  }

  isCanceled(): boolean {
    return this.props.status === SubscriptionStatus.CANCELED
  }

  cancel(): Subscription {
    return new Subscription({
      ...this.props,
      cancelAtPeriodEnd: true,
    })
  }

  changePlan(newPlan: Plan): Subscription {
    return new Subscription({
      ...this.props,
      plan: newPlan,
    })
  }

  equals(other: Subscription): boolean {
    return this.props.plan === other.props.plan &&
      this.props.status === other.props.status &&
      this.props.currentPeriodEnd.getTime() === other.props.currentPeriodEnd.getTime() &&
      this.props.cancelAtPeriodEnd === other.props.cancelAtPeriodEnd &&
      this.props.externalSubscriptionId === other.props.externalSubscriptionId
  }
}
