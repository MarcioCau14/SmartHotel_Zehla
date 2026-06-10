import { Result } from '../../../domain/shared/Result';
import { IPaymentGateway, SubscriptionPlan, CustomerInfo } from '../../../domain/financeiro/gateways/IPaymentGateway';
import { ISubscriptionRepository } from '../ports/ISubscriptionRepository';
import { Subscription } from '../../../domain/financeiro/entities/Subscription';
import { Money } from '../../../domain/financeiro/value-objects/Money';
import { SubscriptionStatus } from '../../../domain/financeiro/enums/SubscriptionStatus';
import { PaymentMethodType } from '../../../domain/financeiro/enums/PaymentMethodType';

export interface CriarAssinaturaInput {
  propertyId: string;
  tenantId: string;
  plan: 'LITE' | 'PRO' | 'MAX';
  paymentMethod: PaymentMethodType;
  customer: CustomerInfo;
}

export interface CriarAssinaturaOutput {
  subscription: Subscription;
  paymentUrl: string;
}

export class CriarAssinaturaUseCase {
  constructor(
    private readonly paymentGateway: IPaymentGateway,
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(input: CriarAssinaturaInput): Promise<Result<CriarAssinaturaOutput, string>> {
    // Validar plano
    const planPrices: Record<string, number> = {
      LITE: 19700,    // R$197,00 em centavos
      PRO: 39700,     // R$397,00
      MAX: 69700      // R$697,00
    };
    const price = planPrices[input.plan];
    if (!price) {
      return Result.fail('PLANO_INVALIDO');
    }

    // Criar entidade de assinatura
    const moneyResult = Money.create(price / 100, 'BRL');
    if (moneyResult.isFail) {
      return Result.fail(moneyResult.error);
    }

    const subscriptionResult = Subscription.create({
      id: crypto.randomUUID(),
      propertyId: input.propertyId,
      tenantId: input.tenantId,
      plan: input.plan,
      status: SubscriptionStatus.PENDING,
      amount: moneyResult.value,
      paymentMethod: input.paymentMethod,
      externalId: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      metadata: {
        customer_email: input.customer.email,
        customer_name: input.customer.name
      }
    });

    if (subscriptionResult.isFail) {
      return Result.fail(subscriptionResult.error);
    }

    const subscription = subscriptionResult.value;

    // Criar plano no gateway
    const planConfig: SubscriptionPlan = {
      id: subscription.id,
      name: `ZEHLA ${input.plan}`,
      amount: price / 100,
      currency: 'BRL',
      frequency: 1,
      frequencyType: 'months',
      backUrl: `${process.env.APP_URL}/payment/success`,
      notificationUrl: `${process.env.WEBHOOK_URL}/api/webhooks/mercado-pago`
    };

    const gatewayResult = await this.paymentGateway.createSubscription(planConfig, input.customer);
    
    if (gatewayResult.isFail) {
      return Result.fail(`GATEWAY_ERROR: ${gatewayResult.error.message}`);
    }

    const gatewaySubscription = gatewayResult.value;

    // Atualizar com external ID
    const activatedSubscription = subscription.activate(gatewaySubscription.externalId);
    if (activatedSubscription.isFail) {
      return Result.fail(activatedSubscription.error);
    }

    const finalSubscription = activatedSubscription.value;

    // Persistir
    await this.subscriptionRepository.save(finalSubscription);

    const isSandbox = process.env.MERCADO_PAGO_SANDBOX === 'true';
    return Result.ok({
      subscription: finalSubscription,
      paymentUrl: isSandbox ? gatewaySubscription.sandboxInitPoint : gatewaySubscription.initPoint
    });
  }
}
