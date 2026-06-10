import { Result } from '../../../domain/shared/Result';
import { IPaymentGateway, WebhookPayload, PaymentEvent } from '../../../domain/financeiro/gateways/IPaymentGateway';
import { IInvoiceRepository } from '../ports/IInvoiceRepository';
import { ISubscriptionRepository } from '../ports/ISubscriptionRepository';
import { InvoiceStatus } from '../../../domain/financeiro/enums';
import { SubscriptionStatus } from '../../../domain/financeiro/enums/SubscriptionStatus';
import { Money } from '../../../domain/financeiro/value-objects/Money';

export class ProcessarWebhookMercadoPagoUseCase {
  constructor(
    private readonly paymentGateway: IPaymentGateway,
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(payload: WebhookPayload, signature: string): Promise<Result<PaymentEvent, string>> {
    // 1. Validar assinatura HMAC
    const isValid = this.paymentGateway.validateWebhook(payload, signature);
    if (!isValid) {
      return Result.fail('ASSINATURA_WEBHOOK_INVALIDA');
    }

    // 2. Processar webhook no gateway
    const eventResult = await this.paymentGateway.processWebhook(payload);
    if (eventResult.isFail) {
      return Result.fail(`PROCESSAMENTO_WEBHOOK: ${eventResult.error.message}`);
    }

    const event = eventResult.value;

    // 3. Roteamento por tipo de evento
    switch (event.type) {
      case 'payment.approved':
        await this.handlePaymentApproved(event);
        break;
      case 'payment.rejected':
        await this.handlePaymentRejected(event);
        break;
      case 'subscription.authorized':
        await this.handleSubscriptionAuthorized(event);
        break;
      case 'subscription.charged':
        await this.handleSubscriptionCharged(event);
        break;
      case 'subscription.cancelled':
        await this.handleSubscriptionCancelled(event);
        break;
    }

    return Result.ok(event);
  }

  private async handlePaymentApproved(event: PaymentEvent): Promise<void> {
    const invoice = await this.invoiceRepository.findById(event.internalId);
    if (!invoice) {
      console.warn(`Invoice não encontrada: ${event.internalId}`);
      return;
    }

    const moneyResult = Money.create(event.amount, 'BRL');
    if (moneyResult.isOk) {
      const registerResult = invoice.registerPayment(moneyResult.value);
      if (registerResult.isOk) {
        await this.invoiceRepository.save(invoice);
      } else {
        console.error(`Erro ao registrar pagamento na Invoice: ${registerResult.error}`);
      }
    }
  }

  private async handlePaymentRejected(event: PaymentEvent): Promise<void> {
    const invoice = await this.invoiceRepository.findById(event.internalId);
    if (!invoice) return;

    const cancelResult = invoice.cancel(`Mercado Pago payment rejected: ${event.metadata?.status_detail || 'No detail'}`);
    if (cancelResult.isOk) {
      await this.invoiceRepository.save(invoice);
    } else {
      console.error(`Erro ao cancelar Invoice recusada: ${cancelResult.error}`);
    }
  }

  private async handleSubscriptionAuthorized(event: PaymentEvent): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(event.internalId);
    if (!subscription) return;

    const activated = subscription.activate(event.externalId);
    if (activated.isOk) {
      await this.subscriptionRepository.save(activated.value);
    }
  }

  private async handleSubscriptionCharged(event: PaymentEvent): Promise<void> {
    const subscription = await this.subscriptionRepository.findByExternalId(event.externalId);
    if (!subscription) return;

    const updated = subscription.processPayment(new Date());
    if (updated.isOk) {
      await this.subscriptionRepository.save(updated.value);
    }
  }

  private async handleSubscriptionCancelled(event: PaymentEvent): Promise<void> {
    const subscription = await this.subscriptionRepository.findByExternalId(event.externalId);
    if (!subscription) return;

    const cancelled = subscription.cancel();
    if (cancelled.isOk) {
      await this.subscriptionRepository.save(cancelled.value);
    }
  }
}
