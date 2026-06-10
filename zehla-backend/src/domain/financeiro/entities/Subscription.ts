import { Result } from '../../shared/Result';
import { Money } from '../value-objects/Money';
import { PaymentMethodType } from '../enums/PaymentMethodType';
import { SubscriptionStatus } from '../enums/SubscriptionStatus';

export interface SubscriptionProps {
  id: string;
  propertyId: string;
  tenantId: string;
  plan: 'LITE' | 'PRO' | 'MAX';
  status: SubscriptionStatus;
  amount: Money;
  paymentMethod: PaymentMethodType;
  externalId: string | null; // Mercado Pago preapproval_id
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextPaymentDate: Date;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class Subscription {
  private constructor(private readonly props: SubscriptionProps) {
    Object.freeze(this.props);
  }

  static create(props: Omit<SubscriptionProps, 'createdAt' | 'updatedAt'>): Result<Subscription, string> {
    if (props.amount.toNumber() <= 0) {
      return Result.fail('VALOR_ASSINATURA_INVALIDO');
    }
    if (!props.propertyId || !props.tenantId) {
      return Result.fail('TENANT_OU_PROPERTY_OBRIGATORIO');
    }
    
    return Result.ok(new Subscription({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  static restore(props: SubscriptionProps): Subscription {
    return new Subscription(props);
  }

  // Getters imutáveis
  get id(): string { return this.props.id; }
  get propertyId(): string { return this.props.propertyId; }
  get tenantId(): string { return this.props.tenantId; }
  get plan(): 'LITE' | 'PRO' | 'MAX' { return this.props.plan; }
  get status(): SubscriptionStatus { return this.props.status; }
  get amount(): Money { return this.props.amount; }
  get externalId(): string | null { return this.props.externalId; }
  get currentPeriodStart(): Date { return this.props.currentPeriodStart; }
  get currentPeriodEnd(): Date { return this.props.currentPeriodEnd; }
  get nextPaymentDate(): Date { return this.props.nextPaymentDate; }
  get paymentMethod(): PaymentMethodType { return this.props.paymentMethod; }
  get cancelAtPeriodEnd(): boolean { return this.props.cancelAtPeriodEnd; }
  get metadata(): Record<string, unknown> { return this.props.metadata; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Métodos de transição de estado
  activate(externalId: string): Result<Subscription, string> {
    if (this.props.status !== SubscriptionStatus.PENDING) {
      return Result.fail('ASSINATURA_NAO_PENDENTE');
    }
    return Result.ok(new Subscription({
      ...this.props,
      status: SubscriptionStatus.ACTIVE,
      externalId,
      updatedAt: new Date()
    }));
  }

  pause(): Result<Subscription, string> {
    if (this.props.status !== SubscriptionStatus.ACTIVE) {
      return Result.fail('ASSINATURA_NAO_ATIVA');
    }
    return Result.ok(new Subscription({
      ...this.props,
      status: SubscriptionStatus.PAUSED,
      updatedAt: new Date()
    }));
  }

  cancel(): Result<Subscription, string> {
    if (this.props.status === SubscriptionStatus.CANCELLED) {
      return Result.fail('ASSINATURA_JA_CANCELADA');
    }
    return Result.ok(new Subscription({
      ...this.props,
      status: SubscriptionStatus.CANCELLED,
      cancelAtPeriodEnd: true,
      updatedAt: new Date()
    }));
  }

  processPayment(paymentDate: Date): Result<Subscription, string> {
    if (this.props.status !== SubscriptionStatus.ACTIVE) {
      return Result.fail('ASSINATURA_NAO_ATIVA');
    }
    const nextDate = new Date(paymentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    
    return Result.ok(new Subscription({
      ...this.props,
      currentPeriodStart: paymentDate,
      currentPeriodEnd: nextDate,
      nextPaymentDate: nextDate,
      updatedAt: new Date()
    }));
  }

  markPastDue(): Result<Subscription, string> {
    if (this.props.status !== SubscriptionStatus.ACTIVE) {
      return Result.fail('ASSINATURA_NAO_ATIVA');
    }
    return Result.ok(new Subscription({
      ...this.props,
      status: SubscriptionStatus.PAST_DUE,
      updatedAt: new Date()
    }));
  }

  toJSON(): SubscriptionProps {
    return { ...this.props };
  }
}
